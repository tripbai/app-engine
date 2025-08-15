<?php

$targetFile = __DIR__ . '/../../src/app/module/module.interface.ts';
$targetDir = __DIR__ . '/../../src/app/';

if (!file_exists($targetFile)) {
    die("Error: TypeScript file not found at $targetFile\n");
}

$lines = file($targetFile);
$endpoints = [];

$insideType = false;
$braceCount = 0;
$currentType = '';
$currentBlock = [];

foreach ($lines as $line) {
    if (!$insideType && preg_match('/export type (\w+) = \{/', $line, $matches)) {
        $insideType = true;
        $braceCount = 1;
        $currentType = $matches[1];
        $currentBlock = [$line];
        continue;
    }

    if ($insideType) {
        $braceCount += substr_count($line, '{');
        $braceCount -= substr_count($line, '}');
        $currentBlock[] = $line;

        if ($braceCount === 0) {
            // Done collecting the block
            $body = implode("", $currentBlock);

            $endpoint = [
                'name' => $currentType,
                'request' => [],
                // 'response' => null,
            ];

            // Extract request block
            if (preg_match('/request:\s*\{(.+?)\n\s*\}/s', $body, $reqMatch)) {
                $requestBlock = $reqMatch[1];

                if (preg_match('/path:\s*[\'"]([^\'"]+)[\'"]/', $requestBlock, $pathMatch)) {
                    $endpoint['request']['path'] = $pathMatch[1];
                }
                if (preg_match('/method:\s*[\'"]([^\'"]+)[\'"]/', $requestBlock, $methodMatch)) {
                    $endpoint['request']['method'] = $methodMatch[1];
                }
                if (preg_match('/data:\s*\{(.+?)\}/s', $requestBlock, $dataMatch)) {
                    $endpoint['request']['data'] = trim($dataMatch[1]);
                }
            }

            // Extract response block
            // if (preg_match('/response:\s*(\{.*?\})/s', $body, $resMatch)) {
            //     $endpoint['response'] = trim($resMatch[1]);
            // } elseif (preg_match('/response:\s*(Array<\{.*?\}>)/s', $body, $resArrMatch)) {
            //     $endpoint['response'] = trim($resArrMatch[1]);
            // } elseif (preg_match('/response:\s*\[\{.*?\}\]/s', $body, $resArrShorthand)) {
            //     $endpoint['response'] = trim($resArrShorthand[0]);
            // }

            $endpoints[] = $endpoint;

            // Reset state
            $insideType = false;
            $braceCount = 0;
            $currentType = '';
            $currentBlock = [];
        }
    }
}

function reorderPascalCase(string $name): string {
    // Match all words in PascalCase (e.g., Create, Organization, Auth, Token)
    preg_match_all('/[A-Z][a-z0-9]*/', $name, $words);
    $words = $words[0];

    if (count($words) < 2) {
        // Nothing to reorder if single word
        return $name;
    }

    // Move the first word (assumed to be the verb) to the end
    $verb = array_shift($words);
    $words[] = $verb;

    return implode('', $words);
}

function toKebabCase(string $input): string {
    // Insert a hyphen before each uppercase letter (except the first one)
    $kebab = preg_replace('/([a-z])([A-Z])/', '$1-$2', $input);
    $kebab = preg_replace('/([A-Z])([A-Z][a-z])/', '$1-$2', $kebab); // handle edge cases like "APIKey"
    return strtolower($kebab);
}

function toSingular(string $input): string {
    // Check if the last character is 's' or 'S'
    if (strtolower(substr($input, -1)) === 's') {
        return substr($input, 0, -1);
    }
    return $input;
}

function generateUuidV4(): string {
    $data = random_bytes(16);

    // Set version to 0100 (UUID v4)
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);

    // Set variant to 10xxxxxx
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);

    // Convert each byte to two hex digits
    $hex = bin2hex($data);

    // Format as UUID: 8-4-4-4-12
    return vsprintf('%s%s%s%s-%s%s-%s%s-%s%s-%s%s%s%s%s%s', str_split($hex, 2));
}


$boilerplates = [];
foreach ($endpoints as $key => $endpoint) {
    if (!isset($endpoint['request']['path'])) {
        continue; // Skip if path is not set
    }
    if (!isset($endpoint['name'])) {
        continue; // Skip if name is not set
    }
    $boilerplate = [];
    $endpoint['request']['path'] = trim($endpoint['request']['path'], '/');
    $name = $endpoint['name'];
    $parts = explode('/', $endpoint['request']['path']);
    $domain = $parts[1] ?? null;
    $controllerPascalCase = reorderPascalCase($name);
    $controllerKebabCase = toKebabCase($controllerPascalCase);
    $endpoints[$key]['controller'] = $controllerPascalCase . 'Controller';
    $endpoints[$key]['controllerKebab'] = $controllerKebabCase;
    $command = null;
    $commandKebabCase = null;
    $query = null;
    $queryKebabCase = null;
    if (str_contains($name, 'Get')) {
        $queryKebabCase = toKebabCase($name);
        $query = $name . 'Query';

    } else {
        $commandKebabCase = toKebabCase($name);
        $command = $name . 'Command';
    }
    $boilerplate = [
        'name' => $name,
        'domain' => $domain,
        'controller' => $endpoints[$key]['controller'],
        'controllerKebab' => $endpoints[$key]['controllerKebab'],
        'command' => $command,
        'commandKebab' => $commandKebabCase,
        'query' => $query,
        'queryKebab' => $queryKebabCase,
        'request' => $endpoint['request'],
    ];
    $boilerplates[] = $boilerplate;
}

// Output as JSON
// echo json_encode($boilerplates, JSON_PRETTY_PRINT);

$test = 0;
foreach ($boilerplates as $boilerplate) {
    // if ($test > 0) {
    //     continue; // Skip the first iteration
    // }
    $test++;
    $domain = $boilerplate['domain'];
    $singularDomain = toSingular($domain);
    $endpointName = $boilerplate['name'];
    $endpointRequestPath = $boilerplate['request']['path'];
    $lowecasemethod = strtolower($boilerplate['request']['method']);
    if ($lowecasemethod === 'delete') {
        $lowecasemethod = 'del';
    }
    $domainDir = $targetDir . $domain;
    if (!is_dir($domainDir)) {
        mkdir($domainDir, 0777, true);
    }
    $controllerDir = $domainDir . '/controllers/';
    if (!is_dir($controllerDir)) {
        mkdir($controllerDir, 0777, true);
    }
    $controllerFile = $controllerDir . $boilerplate['controllerKebab'] . '.controller.ts';

    $commandOrQueryName = $boilerplate['command'] ?? $boilerplate['query'];
    $commandOrQueryKebabCase = $boilerplate['commandKebab'] ?? $boilerplate['queryKebab'];
    $commandOrQueryType = $boilerplate['command'] ? 'command' : 'query';
    $commandOrQueryFolderName = $boilerplate['command'] ? 'commands' : 'queries';
    $lcCommandOrQueryName = lcfirst($commandOrQueryName);

    $controllerName = $boilerplate['controller'];
    $ucDomain = ucfirst($domain);
    $ucSingularDomain = ucfirst($singularDomain);
    $lcSingularDomain = lcfirst($singularDomain);
    $lcName = lcfirst($endpointName);

    // Creates the controller file
    if (!file_exists($controllerFile)) {
        echo "Creating controller file: $controllerFile\n";
        $controllerContent = <<<EOT
        import { inject, injectable } from "inversify";
        import { $commandOrQueryName } from "../$commandOrQueryFolderName/$commandOrQueryKebabCase.$commandOrQueryType";
        import { del, patch, post, put, get } from "../../../core/router/decorators";
        import { TripBai } from "../../module/module.interface";
        import * as Core from "../../../core/module/types";
        import { BadRequestException, LogicException } from "../../../core/exceptions/exceptions";

        @injectable()
        export class $controllerName {
        
          constructor(
            @inject($commandOrQueryName) private $lcCommandOrQueryName: $commandOrQueryName
          ) {}
        
          @$lowecasemethod<TripBai.$ucDomain.Endpoints.$endpointName>('/$endpointRequestPath')
          async $lcName<T extends TripBai.$ucDomain.Endpoints.$endpointName>(
            params: Core.Route.ControllerDTO<T>
          ): Promise<T['response']> {
            const commandDTO: Parameters<{$commandOrQueryName}["execute"]>[0] = Object.create(null)
            commandDTO.requester = params.requester
            try {
            
            } catch (error) {
              throw new BadRequestException({
                message: 'request failed due to invalid params',
                data: { error }
              })
            }
            throw new LogicException({
              message: 'This controller is not implemented yet',
              data: {
                controller_name: '$controllerName'
              }
            })
          }
        
        }
        EOT;
        file_put_contents($controllerFile, $controllerContent);
    }

    // Creates the command or query file
    $commandOrQueryDir = $domainDir . '/' . $commandOrQueryFolderName . '/';
    if (!is_dir($commandOrQueryDir)) {
        mkdir($commandOrQueryDir, 0777, true);
    }

    $serviceVerbs = [
        'Create',
        'Update',
        'Delete',
        'Get',
    ];
    $possibleServiceDependencyInjection = '';
    $possibleServiceDependencyFilePath = '';
    foreach ($serviceVerbs as $serviceVerb) {
        if (str_contains($commandOrQueryName, $serviceVerb)) {
            $possibleServiceDependencyName = $ucSingularDomain . $serviceVerb . 'Service';
            $possibleServiceDependencyInjection = '@inject(' . $possibleServiceDependencyName . ') private ' . lcfirst($possibleServiceDependencyName) . ': ' . $possibleServiceDependencyName . ',';
            $possibleServiceDependencyFilePath = 'import { '.$possibleServiceDependencyName.' } from "../services/'.$lcSingularDomain.'-'.strtolower($serviceVerb).'.service";';
            break;
        }
    }

    $commandOrQueryFile = $commandOrQueryDir . $commandOrQueryKebabCase . '.' . $commandOrQueryType . '.ts';
    if (!file_exists($commandOrQueryFile)) {
        echo "Creating $commandOrQueryType file: $commandOrQueryFile\n";
        $commandOrQueryContent = <<<EOT
        import { inject, injectable } from "inversify";
        import { OrganizationRequesterFactory } from "../../requester/organization-requester.factory";
        import * as Core from "../../../core/module/types";
        import { LogicException } from "../../../core/exceptions/exceptions";
        import { AbstractEventManagerProvider } from "../../../core/providers/event/event-manager.provider";
        import { UnitOfWorkFactory } from "../../../core/workflow/unit-of-work.factory";
        $possibleServiceDependencyFilePath
        import { {$ucSingularDomain}Repository } from "../$singularDomain.repository";

        @injectable()
        export class $commandOrQueryName {

          constructor(
            @inject(OrganizationRequesterFactory) private organizationRequesterFactory: OrganizationRequesterFactory,
            @inject(UnitOfWorkFactory) private unitOfWorkFactory: UnitOfWorkFactory,
            @inject({$ucSingularDomain}Repository) private {$singularDomain}Repository: {$ucSingularDomain}Repository,
            {$possibleServiceDependencyInjection}
            @inject(AbstractEventManagerProvider) private abstractEventManagerProvider: AbstractEventManagerProvider
          ) {}

          async execute(params: {
            requester: Core.Authorization.Requester
          }) {
            const unitOfWork = this.unitOfWorkFactory.create()
            const requester = this.organizationRequesterFactory.create(params.requester)
            throw new LogicException({
              message: 'This $commandOrQueryType is not implemented yet',
              data: {
                {$commandOrQueryType}_name: '$commandOrQueryName'
              }
            })
          }

        }

        EOT;
        file_put_contents($commandOrQueryFile, $commandOrQueryContent);
    }


    // Creates domain services
    $serviceDir = $domainDir . '/services/';
    if (!is_dir($serviceDir)) {
        mkdir($serviceDir, 0777, true);
    }
    $serviceVerbs = [
        'Create',
        'Update',
        'Delete',
        'Get',
    ];
    foreach ($serviceVerbs as $serviceVerb) {
        $serviceName = $ucSingularDomain . $serviceVerb . 'Service';
        $serviceFileName = toKebabCase($ucSingularDomain . $serviceVerb);
        $serviceFile = $serviceDir . $serviceFileName . '.service.ts';
        // Check if the service file already exists
        if (file_exists($serviceFile)) {
            continue; // Skip if the service file already exists
        }

        if (!file_exists($serviceFile)) {
            echo "Creating service file: $serviceFile\n";
            $serviceContent = <<<EOT
            import { inject, injectable } from "inversify";
            import { {$ucSingularDomain}Repository } from "../$singularDomain.repository";

            @injectable()
            export class $serviceName {

              constructor(
                @inject({$ucSingularDomain}Repository) private {$singularDomain}Repository: {$ucSingularDomain}Repository
              ) {}

            }
            EOT;
            file_put_contents($serviceFile, $serviceContent);
        }
    }


    // Creates domain model
    $modelFileName = toKebabCase($singularDomain);
    $modelFilePath = $domainDir . '/' . $singularDomain . '.model.ts';

    if (!file_exists($modelFilePath)) {
        echo "Creating model file: $modelFilePath\n";
        $modelContent = <<<EOT
        import { BaseEntity } from "../../core/orm/entity/base-entity";

        export class {$ucSingularDomain}Model extends BaseEntity<{$ucSingularDomain}Model> {
        
        }
        EOT;
        file_put_contents($modelFilePath, $modelContent);
    }


    // Creates domain repository
    $repositoryFileName = toKebabCase($singularDomain) . '.repository.ts';
    $repositoryFilePath = $domainDir . '/' . $repositoryFileName;
    if (!file_exists($repositoryFilePath)) {
        echo "Creating repository file: $repositoryFilePath\n";
        $repositoryContent = <<<EOT
        import { inject, injectable } from "inversify";
        import { BaseRepository } from "../../core/orm/repository/base-repository";
        import { AbstractDatabaseProvider } from "../../core/providers/database/database.provider";
        import { AbstractCacheProvider } from "../../core/providers/cache/cache.provider";
        import { {$ucSingularDomain}Model } from "./$singularDomain.model";

        @injectable()
        export class {$ucSingularDomain}Repository extends BaseRepository<{$ucSingularDomain}Model> {

        protected collection: string = '$domain'

          constructor(
            @inject(AbstractDatabaseProvider) private DatabaseProvider: AbstractDatabaseProvider,
            @inject(AbstractCacheProvider) private CacheProvider: AbstractCacheProvider
          ){
            super(
            {$ucSingularDomain}Model,
            DatabaseProvider,
            CacheProvider
            )
          }

        }

        EOT;
        file_put_contents($repositoryFilePath, $repositoryContent);
    }


    // Create domain events 
    $domainFileName = toKebabCase($singularDomain) . '.events.ts';
    $domainFilePath = $domainDir . '/' . $domainFileName;
    if (!file_exists($domainFilePath)) {
        echo "Creating domain events file: $domainFilePath\n";
        $domainContent = '';
        $domainContent .= 'import { EventInterface } from "../../core/providers/event/event-manager.provider"' . PHP_EOL;
        $domainContent .= 'import { '.$ucSingularDomain.'Model } from "./'.$singularDomain.'.model";' . PHP_EOL;
        $domainContent .= PHP_EOL;

        $eventVerbs = [
            'Created',
            'Updated',
            'Deleted',
        ];

        foreach ($eventVerbs as $eventVerb) {
            $eventStaticId = generateUuidV4();
            $eventClassName = $ucSingularDomain . $eventVerb . 'Event';
            $domainContent .= 'export class ' . $eventClassName . ' implements EventInterface {' . PHP_EOL;
                $domainContent .= "  id() {return '" . $eventStaticId . "';}" . PHP_EOL;
                $domainContent .= '  async handler('.$lcSingularDomain.'Model: '.$ucSingularDomain.'Model){}' . PHP_EOL;
            $domainContent .= '}' . PHP_EOL . PHP_EOL;
        }

        file_put_contents($domainFilePath, $domainContent);
    }

    // Creating validator file
    $validatorFileName = toKebabCase($singularDomain) . '.validator.ts';
    $validatorFilePath = $domainDir . '/' . $validatorFileName;
    if (!file_exists($validatorFilePath)) {
        echo "Creating validator file: $validatorFilePath\n";
        $validatorContent = <<<EOT
        export namespace {$ucSingularDomain}Validator {

        }
        EOT;
        file_put_contents($validatorFilePath, $validatorContent);
    }

    // Creating assertion file
    $assertionFileName = toKebabCase($singularDomain) . '.assertions.ts';
    $assertionFilePath = $domainDir . '/' . $assertionFileName;
    if (!file_exists($assertionFilePath)) {
        echo "Creating assertion file: $assertionFilePath\n";
        $assertionContent = <<<EOT
        import { inject, injectable } from "inversify";

        @injectable()
        export class {$ucSingularDomain}Assertions {

            constructor(
                
            ) {}
        }
        EOT;
        file_put_contents($assertionFilePath, $assertionContent);
    }

    
}
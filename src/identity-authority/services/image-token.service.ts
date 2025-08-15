import { inject, injectable } from "inversify";
import { AbstractJWTProvider } from "../../core/providers/jwt/jwt.provider";
import { Core } from "../../core/module/module";
import { AppENV } from "../../core/application/appEnv";
import { EntityToolkit } from "../../core/orm/entity/entity-toolkit";
import { FileUploadPath } from "../../core/helpers/fileuploadpath";
import { IsValid } from "../../core/helpers/isvalid";

export type IAuthImageTokenPayload = {
  type: "profile_photo" | "cover_photo";
  upload_for_entity_id: Core.Entity.Id;
  image_path: Core.File.UploadPath;
};

@injectable()
export class IAuthImageTokenService {
  private issuer: string = "identity-authority:images";
  private collection: string = "identity-authority";
  private tokenExpiryInMinutes: number = 60;

  constructor(
    @inject(AbstractJWTProvider)
    private abstractJwtProvider: AbstractJWTProvider
  ) {}

  generate(
    type: "profile_photo" | "cover_photo",
    forEntityId: Core.Entity.Id,
    imagePath: Core.File.UploadPath
  ): string {
    const payload: IAuthImageTokenPayload = {
      type: type,
      upload_for_entity_id: forEntityId,
      image_path: imagePath,
    };
    return this.abstractJwtProvider.generate<IAuthImageTokenPayload>({
      issuer: this.issuer,
      audience: payload.upload_for_entity_id,
      data: payload,
      untilMinutes: this.tokenExpiryInMinutes,
      secret: getEnv("SECRET_KEY"),
    });
  }

  parse(forEntityId: Core.Entity.Id, token: string): IAuthImageTokenPayload {
    const parsedToken = this.abstractJwtProvider.parse(
      getEnv("SECRET_KEY"),
      token
    );
    if (typeof parsedToken.iss !== "string") {
      throw new Error("invalid image token: missing issuer");
    }
    if (parsedToken.iss !== this.issuer) {
      throw new Error("invalid image token: issuer mismatch");
    }
    if (typeof parsedToken.aud !== "string") {
      throw new Error("invalid image token: missing audience");
    }
    if (typeof parsedToken.aud !== forEntityId) {
      throw new Error("invalid image token: audience mismatch");
    }
    if (typeof parsedToken.data !== "object") {
      throw new Error("invalid image token: missing data");
    }
    if (parsedToken.data === null) {
      throw new Error("invalid image token: missing data");
    }
    const payload = parsedToken.data;
    if (!("type" in payload)) {
      throw new Error("invalid user image token: missing payload type");
    }
    if (payload.type !== "profile_photo" && payload.type !== "cover_photo") {
      throw new Error("invalid user image token: invalid payload type");
    }
    if ("upload_for_entity_id" in payload && "image_path" in payload) {
      assertValidEntityId(payload.upload_for_entity_id);
      assertNonEmptyString(payload.image_path);
      FileUploadPath.assert(payload.image_path);
      return {
        type: payload.type,
        upload_for_entity_id: payload.upload_for_entity_id,
        image_path: payload.image_path,
      };
    }
    throw new Error("invalid user image token: invalid payload");
  }
}

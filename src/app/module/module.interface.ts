import { Endpoint } from "aws-sdk";
import { Core } from "../../core/module/module";
import { type } from "os";

export namespace TripBai {
  export namespace Packages {
    export namespace Endpoints {
      export type CreatePackage = {
        request: {
          path: '/tripbai/packages'
          method: 'POST'
          data: {
            name: string
          }
        }
        response: {
          entity_id: Core.Entity.Id
        }
      }
      export type GetPackage = {
        request: {
          path: '/tripbai/packages/:package_id'
          method: 'GET'
          data: {}
        }
        response: {
          name: string
          entity_id: Core.Entity.Id
          created_at: string
          updated_at: string
          is_active: boolean
          is_default: boolean
        }
      }
      export type GetPackages = {
        request: {
          path: '/tripbai/packages'
          method: 'GET'
        }
        response: Array<{
          entity_id: Core.Entity.Id
          name: string
          created_at: string
          updated_at: string
          is_active: boolean
          is_default: boolean
        }>
      }
      export type UpdatePackage = {
        request: {
          path: '/tripbai/packages/:package_id'
          method: 'PUT'
          data: {
            name?: string
            is_active?: boolean
            is_default?: boolean
          }
        }
        response: {}
      }
      export type DeletePackage = {
        request: {
          path: '/tripbai/packages/:package_id'
          method: 'DELETE'
        }
        response: {}
      }
    }
  }
  export namespace Organizations {
    export namespace Fields {
      export type Status = 'active' | 'deactivated' | 'suspended' | 'pending' | 'archived'
    }
    export namespace Endpoints {
      export type CreateOrganization = {
        request: {
          path: '/tripbai/organizations',
          method: 'POST',
          data: {
            business_name: string
            package_id: Core.Entity.Id
            // A token that certifies the user has access to the tenant
            tenant_access_certification_token: string
          }
        }
        response: {
          // The unique identifier of the organization
          organization_id: Core.Entity.Id
        }
      }
      export type GenerateAuthToken = {
        request: {
          path: '/tripbai/organizations/:organization_id/tokens'
          method: 'POST'
          data: {
            // A token that certifies the user has access to the tenant
            tenant_access_certification_token: string
          }
        }
        response: {
          upgraded_token: string
        }
      }
      export type UpdateOrganization = {
        request: {
          path: '/tripbai/organizations/:organization_id'
          method: 'PATCH'
          data: {
            business_name?: string
            package_id?: Core.Entity.Id
            status?: Organizations.Fields.Status
          }
        }
        response: {}
      }
    }
  }
  export namespace AccessLibrary {
    export namespace Endpoints {
      export type GetUserAccessLibrary = {
        request: {
          path: '/tripbai/access-library/users/:user_id'
          method: 'GET'
        }
        response: Array<{
          organization_id: Array<Core.Entity.Id>
          store_ids: Array<Core.Entity.Id>
        }>
      }
      export type AddUserToStore = {
        request: {
          path: '/tripbai/access-library/tenants/:tenant_id/add-to-stores'
          method: 'POST'
          data: {
            user_id: Core.Entity.Id
            store_ids: Array<Core.Entity.Id>
            tenant_user_added_cert_token: string
          }
        }
        response: {}
      }
      export type RemoveUserFromStore = {
        request: {
          path: '/tripbai/access-library/tenants/:tenant_id/remove-from-stores'
          method: 'POST'
          data: {
            user_id: Core.Entity.Id
            store_ids: Array<Core.Entity.Id>
            tenant_user_removed_cert_token: string
          }
        }
        response: {}
      }
    }
  }
  export namespace Images {
    export namespace Endpoints {
      export type UploadImage = {
        request: {
          path: '/tripbai/images'
          method: 'POST'
          data: {
            image: Blob | File
            upload_for_entity_id: Core.Entity.Id
            entity_type: 'organization' | 'store' | 'tour'
          }
        }
        response: {
          image_path: Core.File.UploadPath
          image_upload_token: string
        }
      }
    }
  }
  export namespace Stores {
    export namespace Fields {
      export type APIKey = { length: 32, access: 'public' }
      export type Status = Organizations.Fields.Status
    }
    export type Snippet = {
      name: string
      about: string | null
      organization_id: Core.Entity.Id
      location_id: Locations.Id
      profile_photo_src: Core.File.UploadPath | null
      cover_photo_src: Core.File.UploadPath | null
      status: Organizations.Fields.Status
    }
    export namespace Endpoints {
      export type CreateStore = {
        request: {
          path: '/tripbai/stores'
          method: 'POST'
          data: {
            organization_id: Core.Entity.Id
            name: string
            about?: string
            location_id: Locations.Id
            profile_photo_src?: Core.File.UploadPath
            cover_photo_src?: Core.File.UploadPath
            status?: Organizations.Fields.Status
          }
        }
        response: {
          entity_id: Core.Entity.Id
          organization_id: Core.Entity.Id
          name: string
          about: string | null
          location_id: Locations.Id
          profile_photo_src: Core.File.UploadPath | null
          cover_photo_src: Core.File.UploadPath | null
          status: Organizations.Fields.Status
        }
      }
      export type GetStore = {
        request: {
          path: '/tripbai/stores/:store_id'
          method: 'GET'
        }
        response: {
          entity_id: Core.Entity.Id
          organization_id: Core.Entity.Id
          name: string
          about: string | null
          location_id: Locations.Id
          profile_photo_src: Core.File.UploadPath | null
          cover_photo_src: Core.File.UploadPath | null
          status: Organizations.Fields.Status
        }
      }
      export type UpdateStore = {
        request: {
          path: '/tripbai/stores/:store_id'
          method: 'PUT'
          data: {
            name?: string
            about?: string
            location_id?: Locations.Id
            profile_photo_src?: Core.File.UploadPath
            cover_photo_src?: Core.File.UploadPath
            status?: Organizations.Fields.Status
          }
        }
        response: {}
      }
    }
  }
  export namespace Features {
    export namespace Endpoints {
      export type RegisterDefaultFeature = {
        request: {
          path: '/tripbai/features'
          method: 'POST'
          data: {
            key: string
            value: string
            package_id: Core.Entity.Id
          }
        }
        response: {
          entity_id: Core.Entity.Id
          key: string
          value: string
        }
      }
      export type CreateFeatureOverride = {
        request: {
          path: '/tripbai/features/overrides'
          method: 'POST'
          data: {
            key: string
            value: string
            package_id: Core.Entity.Id
            organization_id: Core.Entity.Id
            override_for_entity_id: Core.Entity.Id
            override_for_entity_type: 'organization' | 'store'
          }
        }
        response: {}
      }
    }
  }
  export namespace Locations {
    export type Id = string & { is_location_id: true }
  }
  export namespace Tours {
    export namespace Fields {
      export type Status = 'active' | 'draft' | 'archived'
      export type Name = string & { min_length: 5, max_length: 120 }
      export type DayNightNotation = string & { type: 'duration_notation'}
      export type Duration = DayNightNotation & { valid: true }
      export type Time = string & { type: 'time_notation' }
      export type Frequency = {
        type: 'daily' | 'weekly' | 'specific'
        days: Array<'SU' | 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA'>
        weeks: Array<'1' | '2' | '3' | '4' | '5' | '6' | '7' >
      }
      export type PickUpAndDropOffItem = {
        location: string
        time: string
        day: string
        notes: Array<string>
      }
      export type HotelAndAccomondation = {
        all_nights: boolean
        night_no: number
        hotel_name: string
        line_address: string | null
        location_id: Locations.Id
        notes: Array<string>
      }
      export type Itinerary = {
        type: 'food' 
        name: 'breakfast' | 'lunch' | 'dinner' | 'break',
        time: Time
        is_free: boolean
        location: string
        notes: Array<string>
      } | {
        type: 'destination'
        name: string
        time: Time
        image_paths: Array<string>
        image_tokens: Array<string>
        is_free_entrance: boolean
        activities: Array<string>
        notes: Array<string>
      }
    }
    export type Snippet = {
      entity_id: string
      external_resource_id: string | null
      name: TripBai.Tours.Fields.Name
      duration: TripBai.Tours.Fields.Duration
      joiners_slot: number 
      price: number 
      reservation_fee: number 
      frequency: TripBai.Tours.Fields.Frequency
      pay_days_before_trip: number
      pickup_dropoff: Array<TripBai.Tours.Fields.PickUpAndDropOffItem>
      allow_propose_pickup_dropoff: boolean
      hotel_accomondation: Array<TripBai.Tours.Fields.HotelAndAccomondation>
      about: string
      is_cancellable: boolean
      cancel_before_days: number 
      is_refundable: boolean
      refund_policies: Array<string>
      store_id: string
      itineraries: Array<Array<TripBai.Tours.Fields.Itinerary>>
      status: Fields.Status
    }
    export namespace Endpoints {
      export type CreateTour = {
        request: {
          path: '/trip-engine/tours'
          method: 'POST'
          data: Omit<Snippet, 'entity_id' | 'external_resource_id'>
        }
        response: {
          entity_id: Core.Entity.Id
          external_resource_id: string | null
        }
      }
      export type GetTour = {
        request: {
          path: '/trip-engine/tours/:tour_id'
          method: 'GET'
        }
        response: Snippet & {
          created_at: string
          updated_at: string
          archived_at: string | null
        }
      }
      export type UpdateTour = {
        request: {
          path: '/trip-engine/tours/:tour_id'
          method: 'PATCH'
          data: Partial<Omit<Snippet, 'entity_id' | 'external_resource_id' | 'store_id'>>
        }
        response: {}
      }
      export type DeleteTour = {
        request: {
          path: '/trip-engine/tours/:tour_id'
          method: 'DELETE'
        }
        response: {}
      }
    }
  }
  export namespace Schedules {
    export namespace Fields {
      export type Item = {
        tour_id: Core.Entity.Id
        date: string
        reservations_count: number
      }
    }
    export namespace Endpoints {
      export type GetTourSchedule = {
        request: {
          path: '/tripbai/schedules/tour?tour_id=:tour_id&from_date=:from_date&range=:range'
          method: 'GET'
        }
        response: {
          tour_id: string
          from_date: string
          schedules: Array<Fields.Item>
        }
      }
      export type GetToursSchedule = {
        request: {
          path: '/tripbai/schedules/tours?store_id=:store_id&from_date=:from_date&range=:range'
          method: 'GET'
        }
        response: {
          store_id: Core.Entity.Id
          from_date: string
          schedules: Array<Fields.Item>
        }
      }
    }
  }
}
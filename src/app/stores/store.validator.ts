// export namespace StoreValidator {
//   export const name = (value: string) => {
//     if (value.length < 5 || value.length > 64) {
//       throw new Error('store name must be within 5 - 65 characters')
//     }
//   }

//   export const about = (value: string) => {
//     if (value.length < 1 || value.length > 320) {
//       throw new Error('store about must be within 1 - 320 characters')
//     }
//   }

//   export const language = (value: string) => {
//     /** @TODO implement language codes */
//   }

//   export const location_id = (value: string) => {
//     /** @TODO implement location_id codes */
//   }

//   export const photo = (value: string) => {
//     if (value.length < 1 || value.length > 360) {
//       throw new Error('store image url must be within 1 - 360 characters')
//     }
//   }

//   export const status = (value: string) => {
//     if (
//       value !== 'active' &&
//       value !== 'deactivated' &&
//       value !== 'suspended' &&
//       value !== 'pending'
//     ) {
//       throw new Error('store status value is invalid')
//     }

//   }
// }

const mod = 'routes'

// -------------------------------------------------------------------------------------------------
// External dependencies
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
// API request constants
// -------------------------------------------------------------------------------------------------
import {
  ACT_COMMIT,
  ACT_DELETION,
  ACT_EXT_SEARCH,
  ACT_INIT,
  ACT_REPORT,
  ACT_SEARCH,
  ACT_SEND,
  ACT_UUID_GEN,
  OBJ_MEDIA,
  OBJ_METADATA,
  OBJ_PUB_KEYS,
  OBJ_REPORTS,
  PARAM_ID,
  PARAM_OBJECT,
  PARAM_PROP,
  PARAM_REPORT_ID,
  PARAM_THESAURUS_CODE,
  PARAM_THESAURUS_LANG,
  ROUTE_NAME,
  ROUTE_OPT,
  URL_PREFIX_CHECK,
  URL_PREFIX_PRIVATE,
  URL_PREFIX_PUBLIC,
  URL_PUB_API_VERSION,
  URL_PUB_METADATA,
  URL_PV_APP_ENV_ACCESS,
  URL_PV_APP_HASH_ACCESS,
  URL_PV_DB_ACCESS,
  URL_PV_GIT_HASH_ACCESS,
  URL_PV_LICENCE_ACCESS,
  URL_PV_LICENCE_CODES_ACCESS,
  URL_PV_LOGS_ACCESS,
  URL_PV_NODE_VERSION_ACCESS,
  URL_PV_OBJECT_GENERIC,
  URL_PV_PORTAL_PREFIX,
  URL_PV_THESAURUS_ACCESS,
  URL_SUFFIX_NODE,
  URL_SUFFIX_PORTAL,
  URL_SUFFIX_TOKEN_CHECK,
  URL_SUFFIX_TOKEN_GET,
} from '../config/constApi.js'

// -------------------------------------------------------------------------------------------------
// Internal dependencies
// -------------------------------------------------------------------------------------------------
import { logD } from '../utils/logging.js'

// -------------------------------------------------------------------------------------------------
// Swagger documentation
// -------------------------------------------------------------------------------------------------
// import documentation from './documentation/metadataApi'

// -------------------------------------------------------------------------------------------------
// Controllers
// -------------------------------------------------------------------------------------------------
import {
  addObjects,
  countObjects,
  deleteManyObjects,
  deleteObjectList,
  deleteSingleObject,
  generateUUID,
  getManyPubKeys,
  getMetadataListAndCount,
  getObjectList,
  getSearchableProperties,
  getSingleObject,
  searchObjects,
  upsertObjects,
} from '../controllers/genericController.js'
import {
  commitMedia,
  getSingleMetadata,
  initThemes,
  initWithODR,
  searchMetadata,
  sendManyMetadataToPortal,
  updateAllMetadataStatus,
} from '../controllers/metadataController.js'
import {
  addOrEditSingleReportForMetadata,
  addOrEditSingleReportForObject,
  addSingleReportForObject,
  deleteEveryReportForObject,
  deleteManyReportForObject,
  deleteReportsBefore,
  deleteSingleReportForObject,
  getReportListForMetadata,
  getReportListForObject,
  getReportListForObjectType,
  getSingleReportForMetadata,
  getSingleReportForObject,
} from '../controllers/reportController.js'

import {
  dropCollection,
  dropDB,
  dumpDB,
  getCollections,
  restoreDB,
} from '../controllers/dbController.js'
import { getLogs, searchLogs } from '../controllers/logController.js'
import {
  getApiVersion,
  getAppHash,
  getEnvironment,
  getGitHash,
  getNodeVersion,
  serveFavicon,
} from '../controllers/sysController.js'

import {
  getAllLicenceCodes,
  getAllLicences,
  initLicences,
} from '../controllers/licenceController.js'
import {
  getEveryThesaurus,
  getSingleThesaurus,
  getSingleThesaurusLabels,
} from '../controllers/skosController.js'

import { getPortalBaseUrl } from '../config/confPortal.js'
import { getPublicUrl } from '../config/confSystem.js'
import {
  checkStoredToken,
  deleteMetadata,
  exposedGetPortalToken,
  getMetadata,
  sendMetadata,
} from '../controllers/portalController.js'
import { getSinglePubKey } from '../controllers/publicKeyController.js'
import {
  getPortalCachedMetadataList,
  getPortalMetadataFields,
} from '../controllers/stateController.js'
import { test } from '../controllers/testController.js'

// -------------------------------------------------------------------------------------------------
// Free routes (no authentification required)
// -------------------------------------------------------------------------------------------------
export const publicRoutes = [
  // -------------------------------------------------------------------------------------------------
  // Accessing app info
  // -------------------------------------------------------------------------------------------------
  {
    description: 'Favicon',
    method: 'GET',
    url: `/favicon.png`,
    handler: serveFavicon,
    config: { [ROUTE_NAME]: 'pub_get_favicon' },
  },

  // -------------------------------------------------------------------------------------------------
  // Generic routes for accessing metadata
  // -------------------------------------------------------------------------------------------------
  /*
   * @oas [get] /api/v1/resources
   * description: 'Access all metadata on the RUDI producer node'
   * parameters:
   *   - (query) limit {Integer:int32} The number of resources to return
   */
  {
    description: 'Access all metadata on the RUDI producer node',
    method: 'GET',
    url: URL_PUB_METADATA,
    handler: getMetadataListAndCount,
    config: { [ROUTE_NAME]: 'pub_get_all_metadata' },
  },
  /*
   * @oas [get] /api/v1/resources/{metaId}
   * description: 'Access one identified metadata'
   * parameters:
   *   - (path) metaId=bf4895c4-bf41-4f59-a4c7-14e1cb315d04 {String:UUIDv4} The metadata UUID
   *   - (query) limit {Integer:int32} The maximum number of metadata in the result set
   *      (default = 100, max = 500)
   *   - (query) offset {Integer:int32} The number of metadata to skip before starting to collect
   *      the result set (default = 0)
   *   - (query) fields {String} Comma-separated properties that are kept for displaying the
   *      elements of the result set
   *   - (query) sort_by {String} Comma-separated properties tused to order the metadata in the
   *      result set, ordered by decreasing priority. A minus sign before the field name means
   *      metadata will be sorted by decreasing values over this particular field
   *   - (query) updated_after {String:date} The date after which the listed metadata were updated
   *   - (query) updated_before {String:date} The date before which the listed metadata were updated
   */
  {
    description: 'Access one identified metadata',
    method: 'GET',
    url: `${URL_PUB_METADATA}/:${PARAM_ID}`,
    handler: getSingleMetadata,
    config: { [ROUTE_NAME]: 'pub_get_one_metadata' },
  },

  /**
   * Search objects
   */
  {
    description: 'Search metadata',
    method: 'GET',
    url: `${URL_PUB_METADATA}/${ACT_SEARCH}`,
    handler: searchMetadata,
    config: { [ROUTE_NAME]: 'pub_rch_obj' },
  },
  /*
   * @oas [get] /api/version
   * tags:
   * - free
   * security:
   * - authRudi: [portal]
   * description: 'Get current API version'
   * responses:
   *   '200':
   *     description: 'The API version'
   *     content:
   *       'text/plain; charset=utf-8':
   *         schema:
   *           type: 'string'
   *         examples:
   *            ' ':
   *              value: '1.2.3'
   */
  {
    description: 'Get current API version',
    method: 'GET',
    url: URL_PUB_API_VERSION,
    handler: getApiVersion,
    config: { [ROUTE_NAME]: 'pub_get_api_version' },
  },

  // redirection: GET /api -> GET /api/v1/resources
  {
    description: 'Redirection: GET /api -> GET /api/v1/resources',
    method: 'GET',
    url: `/api`,
    config: { [ROUTE_NAME]: 'redirect_get_data' },
    handler: function (req, reply) {
      logD(mod, `redirect`, `${req.method} ${URL_PUB_METADATA}`)
      reply.redirect(URL_PUB_METADATA)
    },
  },
  // redirection: GET /api/v1 -> GET /api/v1/resources
  {
    description: 'Redirection: GET /api/v1 -> GET /api/v1/resources',
    method: 'GET',
    url: '/api/v1',
    config: { [ROUTE_NAME]: 'redirect_get_data' },
    handler: function (req, reply) {
      logD(mod, `redirect`, `${req.method} ${URL_PUB_METADATA}`)
      reply.redirect(URL_PUB_METADATA)
    },
  },
  // redirection: GET /resources -> GET /api/v1/resources
  {
    description: 'Redirection: GET /resources -> GET /api/v1/resources',
    method: 'GET',
    url: `/${OBJ_METADATA}`,
    config: { [ROUTE_NAME]: 'redirect_get_data' },
    handler: function (req, reply) {
      const newRoute = `${URL_PREFIX_PUBLIC}${req.url}`
      logD(mod, `redirect`, `${req.method} ${newRoute}`)
      reply.redirect(308, newRoute)
    },
  },
  // redirection: GET /resources/:id -> GET /api/v1/resources/:id
  {
    description: 'Redirection: GET /resources/:id -> GET /api/v1/resources/:id',
    method: 'GET',
    url: `/${OBJ_METADATA}/:${PARAM_ID}`,
    config: { [ROUTE_NAME]: 'redirect_get_data' },
    handler: function (req, reply) {
      const newRoute = `${URL_PREFIX_PUBLIC}${req.url}`
      logD(mod, `redirect`, `${req.method} ${newRoute}`)
      reply.redirect(308, newRoute)
    },
  },

  {
    description: 'Get every public key',
    method: 'GET',
    url: `${URL_PREFIX_PUBLIC}/${OBJ_PUB_KEYS}`,
    handler: getManyPubKeys,
    config: { [ROUTE_NAME]: 'pub_get_all_pub_keys' },
  },
  {
    description: 'Get a public key with its name',
    method: 'GET',
    url: `${URL_PREFIX_PUBLIC}/${OBJ_PUB_KEYS}/:${PARAM_ID}`,
    handler: getSinglePubKey,
    config: { [ROUTE_NAME]: 'pub_get_one_pub_key' },
  },
  {
    description: 'Get a public key property value given its name',
    method: 'GET',
    url: `${URL_PREFIX_PUBLIC}/${OBJ_PUB_KEYS}/:${PARAM_ID}/:${PARAM_PROP}`,
    handler: getSinglePubKey,
    config: { [ROUTE_NAME]: 'pub_get_one_pub_key_prop' },
  },
]
// -------------------------------------------------------------------------------------------------
// 'Public' routes (Portal authentification required)
// -------------------------------------------------------------------------------------------------
export const portalRoutes = [
  // Routes accessed by RUDI Portal:
  // /resources GET
  // /resources/{id} GET
  // /resources/{id}/report PUT

  // -------------------------------------------------------------------------------------------------
  // Integration reports for one particular object
  // -------------------------------------------------------------------------------------------------

  // Add/edit 1 report for one object integration
  {
    description: 'Add/edit 1 report for one object integration',
    method: 'PUT',
    url: `/${OBJ_METADATA}/:${PARAM_ID}/${ACT_REPORT}`,
    handler: addOrEditSingleReportForMetadata,
    config: { [ROUTE_NAME]: 'portal_upsert_one_report' },
  },

  // Add/edit 1 report for one object integration
  {
    description: 'Add/edit 1 report for one object integration',
    method: 'PUT',
    url: `${URL_PUB_METADATA}/:${PARAM_ID}/${ACT_REPORT}`,
    handler: addOrEditSingleReportForMetadata,
    config: { [ROUTE_NAME]: 'portal_upsert_one_report' },
  },

  // Get all reports for one object integration
  {
    description: 'Get all reports for one object integration',
    method: 'GET',
    url: `${URL_PUB_METADATA}/:${PARAM_ID}/${ACT_REPORT}`,
    handler: getReportListForMetadata,
    config: { [ROUTE_NAME]: 'portal_get_all_obj_report' },
  },
  // Get 1 report for one object integration
  {
    description: 'Get 1 report for one object integration',
    method: 'GET',
    url: `${URL_PUB_METADATA}/:${PARAM_ID}/${ACT_REPORT}/:${PARAM_REPORT_ID}`,
    handler: getSingleReportForMetadata,
    config: { [ROUTE_NAME]: 'portal_get_one_obj_report' },
  },

  // Redirection for getting integration reports
  {
    description: 'Redirection for getting integration reports',
    method: 'GET',
    url: `/${OBJ_METADATA}/:${PARAM_ID}/*`,
    config: { [ROUTE_NAME]: 'redirect_get_plus' },
    handler: function (req, reply) {
      const newRoute = `${URL_PREFIX_PUBLIC}${req.url}`
      logD(mod, `redirect`, `${req.method} ${newRoute}`)
      reply.redirect(308, newRoute)
    },
  },
  // Redirection for adding an integration report
  {
    description: 'Redirection for adding an integration report',
    method: 'PUT',
    url: `/${OBJ_METADATA}/*`,
    config: { [ROUTE_NAME]: 'redirect_put_plus' },
    handler: function (req, reply) {
      const newRoute = `${URL_PREFIX_PUBLIC}${req.url}`
      logD(mod, `redirect`, `${req.method} ${newRoute}`)
      reply.redirect(308, newRoute)
    },
  },
]

// -------------------------------------------------------------------------------------------------
// Private routes
// -------------------------------------------------------------------------------------------------
/**
 * Routes that don't need a JWT check (to be accessed by internal programs)
 */
export const unrestrictedPrivateRoutes = [
  /*
   * @oas [get] /api/admin/hash
   * scope: public
   * description: 'Get current git hash'
   * responses:
   *   '200':
   *     description: 'The API version'
   *     content:
   *       'text/plain; charset=utf-8':
   *         schema:
   *           type: 'string'
   *         examples:
   *           'gitHash':
   *              value: '0e636d4'
   */
  {
    description: 'Get current git hash',
    method: 'GET',
    url: `${URL_PV_GIT_HASH_ACCESS}`,
    handler: getGitHash,
    config: { [ROUTE_NAME]: 'dev_get_git_hash' },
  },
  /*
   * @oas [get] /api/admin/apphash
   * scope: public
   * description: 'Get current git hash from the running application'
   * responses:
   *   '200':
   *     description: 'The API version'
   *     content:
   *       'text/plain; charset=utf-8':
   *         schema:
   *           type: 'string'
   *         examples:
   *           'appHash':
   *              value: '0e636d4'
   */
  {
    description: 'Get current git hash from the running application',
    method: 'GET',
    url: `${URL_PV_APP_HASH_ACCESS}`,
    handler: getAppHash,
    config: { [ROUTE_NAME]: 'dev_get_app_hash' },
  },
  /*
   * @oas [get] /api/admin/env
   * scope: public
   * description: 'Get environment version of the running application'
   */
  {
    description: 'Get environment version of the running application',
    method: 'GET',
    url: `${URL_PV_APP_ENV_ACCESS}`,
    handler: getEnvironment,
    config: { [ROUTE_NAME]: 'dev_get_app_env' },
  },
]
export const backOfficeRoutes = [
  // -------------------------------------------------------------------------------------------------
  // Generic routes for accessing any object
  // ('Metadata', 'Organizations' and 'Contacts')
  // -------------------------------------------------------------------------------------------------

  // Add one or many objects
  {
    description: 'Add one or many objects',
    method: 'POST',
    url: URL_PV_OBJECT_GENERIC,
    handler: addObjects,
    config: { [ROUTE_NAME]: 'prv_add_one' },

    // schema: documentation.addMetadataSchema
  },
  // Edit 1
  {
    description: 'Edit one object',
    method: 'PUT',
    url: URL_PV_OBJECT_GENERIC,
    handler: upsertObjects,
    config: { [ROUTE_NAME]: 'prv_upsert_one' },
  },
  // Get all
  {
    description: 'Get all objects',
    method: 'GET',
    url: URL_PV_OBJECT_GENERIC,
    handler: getObjectList,
    config: { [ROUTE_NAME]: 'prv_get_all' },
  },
  // Get 1
  {
    description: 'Get one object',
    method: 'GET',
    url: `${URL_PV_OBJECT_GENERIC}/:${PARAM_ID}`,
    handler: getSingleObject,
    config: { [ROUTE_NAME]: 'prv_get_one' },
  },
  // Get 1
  {
    description: 'Get one object property value',
    method: 'GET',
    url: `${URL_PV_OBJECT_GENERIC}/:${PARAM_ID}/:${PARAM_PROP}`,
    handler: getSingleObject,
    config: { [ROUTE_NAME]: 'prv_get_one' },
  },

  // Delete 1
  {
    description: 'Delete one object',
    method: 'DELETE',
    url: `${URL_PV_OBJECT_GENERIC}/:${PARAM_ID}`,
    handler: deleteSingleObject,
    config: { [ROUTE_NAME]: 'prv_del_one' },
  },
  // Delete all
  {
    description: 'Get every object of a type',
    method: 'DELETE',
    url: URL_PV_OBJECT_GENERIC,
    handler: deleteManyObjects,
    config: { [ROUTE_NAME]: 'prv_del_many' },
  },
  // Delete many
  {
    description: 'Get a list of objects of a type',
    method: 'POST',
    url: `${URL_PV_OBJECT_GENERIC}/${ACT_DELETION}`,
    handler: deleteObjectList,
    config: { [ROUTE_NAME]: 'prv_del_list' },
  },

  // Access unlinked data
  // {
  //   method: 'GET',
  //   url: `${URL_PV_OBJECT_GENERIC}/${ACT_UNLINKED}`,
  //   handler: getOrphans,
  //   config: { [ROUTE_NAME]: 'prv_get_orphans' },
  // },
  // Search object
  {
    description: 'Search object',
    method: 'GET',
    url: `${URL_PV_OBJECT_GENERIC}/${ACT_SEARCH}`,
    handler: searchObjects,
    config: { [ROUTE_NAME]: 'prv_obj_search' },
  },
  // Extended search on object
  {
    description: 'Search object (SKOS-powered)',
    method: 'GET',
    url: `${URL_PV_OBJECT_GENERIC}/${ACT_EXT_SEARCH}`,
    handler: searchObjects,
    config: { [ROUTE_NAME]: 'prv_obj_search', [ROUTE_OPT]: ACT_EXT_SEARCH },
  },
  // Get searchable fields for an object type
  {
    description: 'Get searchable fields for an object type',
    method: 'GET',
    url: `${URL_PREFIX_PRIVATE}/${ACT_SEARCH}`,
    handler: getSearchableProperties,
    config: { [ROUTE_NAME]: 'prv_obj_search' },
  },
  // Count the number of objects
  {
    description: 'Count the number of objects of a type',
    method: 'GET',
    url: `${URL_PV_OBJECT_GENERIC}/count`,
    handler: countObjects,
    config: { [ROUTE_NAME]: 'prv_obj_count' },
  },

  // -------------------------------------------------------------------------------------------------
  // Metadata
  // -------------------------------------------------------------------------------------------------
  {
    description: 'Update every metadata status',
    method: 'PUT',
    url: `${URL_PREFIX_PRIVATE}/${OBJ_METADATA}/save`,
    handler: updateAllMetadataStatus,
    config: { [ROUTE_NAME]: 'prv_save_all' },
  },
  // -------------------------------------------------------------------------------------------------
  // Media
  // -------------------------------------------------------------------------------------------------
  // Commit a media
  {
    description: 'Commit a media for a given metadata',
    method: 'POST',
    url: `${URL_PREFIX_PRIVATE}/${OBJ_MEDIA}/:${PARAM_ID}/${ACT_COMMIT}`,
    handler: commitMedia,
    config: { [ROUTE_NAME]: 'prv_media_commit' },
  },
  // -------------------------------------------------------------------------------------------------
  // Integration reports
  // -------------------------------------------------------------------------------------------------

  // Add 1 integration report for an identified object
  {
    description: 'Add an integration report for an identified object',
    method: 'POST',
    url: `${URL_PV_OBJECT_GENERIC}/:${PARAM_ID}/${OBJ_REPORTS}`,
    handler: addSingleReportForObject,
    config: { [ROUTE_NAME]: 'prv_add_obj_report' },
  },

  // Add/edit 1 integration report for an identified object
  {
    description: 'Add/edit an integration report for an identified object',
    method: 'PUT',
    url: `${URL_PV_OBJECT_GENERIC}/:${PARAM_ID}/${OBJ_REPORTS}`,
    handler: addOrEditSingleReportForObject,
    config: { [ROUTE_NAME]: 'prv_upsert_obj_report' },
  },

  // Get all integration reports for an identified object
  {
    description: 'Get all integration reports for an identified object',
    method: 'GET',
    url: `${URL_PV_OBJECT_GENERIC}/:${PARAM_ID}/${OBJ_REPORTS}`,
    handler: getReportListForObject,
    config: { [ROUTE_NAME]: 'prv_get_obj_report_list' },
  },
  // Get 1 report for one object integration
  {
    description: 'Get an identified report for an identified object integration',
    method: 'GET',
    url: `${URL_PV_OBJECT_GENERIC}/:${PARAM_ID}/${OBJ_REPORTS}/:${PARAM_REPORT_ID}`,
    handler: getSingleReportForObject,
    config: { [ROUTE_NAME]: 'prv_get_one_obj_report' },
  },
  // Get all integration reports for one object type
  {
    description: 'Get all integration reports for one object type',
    method: 'GET',
    url: `${URL_PV_OBJECT_GENERIC}/${OBJ_REPORTS}`,
    handler: getReportListForObjectType,
    config: { [ROUTE_NAME]: 'prv_get_all_obj_report' },
  },

  // Delete 1 identified integration report for one object
  {
    description: 'Delete an identified integration report for an identified object',
    method: 'DELETE',
    url: `${URL_PV_OBJECT_GENERIC}/:${PARAM_ID}/${OBJ_REPORTS}/:${PARAM_REPORT_ID}`,
    handler: deleteSingleReportForObject,
    config: { [ROUTE_NAME]: 'prv_del_obj_report' },
  },
  // Delete all integration reports for one object
  {
    description: 'Delete every integration report for an identified object',
    method: 'DELETE',
    url: `${URL_PV_OBJECT_GENERIC}/:${PARAM_ID}/${OBJ_REPORTS}`,
    handler: deleteEveryReportForObject,
    config: { [ROUTE_NAME]: 'prv_del_all_obj_report' },
  },
  // Delete many integration reports for an identified object
  {
    description: 'Delete a list of integration reports for an identified object',
    method: 'POST',
    url: `${URL_PV_OBJECT_GENERIC}/:${PARAM_ID}/${OBJ_REPORTS}/${ACT_DELETION}`,
    handler: deleteManyReportForObject,
    config: { [ROUTE_NAME]: 'prv_del_list_obj_report' },
  },
  // Purge old reports
  {
    description: 'Purge old reports',
    method: 'DELETE',
    url: `${URL_PREFIX_PRIVATE}/${OBJ_REPORTS}`,
    handler: deleteReportsBefore,
    config: { [ROUTE_NAME]: 'prv_del_old_reports' },
  },
]

// -------------------------------------------------------------------------------------------------
// External application/module routes
// -------------------------------------------------------------------------------------------------
export const devRoutes = [
  // -------------------------------------------------------------------------------------------------
  // Accessing app info
  // -------------------------------------------------------------------------------------------------
  /**
   * Get node and npm versions
   */
  {
    description: 'Get node, npm, mongoose and mongodb versions',
    method: 'GET',
    url: `${URL_PV_NODE_VERSION_ACCESS}`,
    handler: getNodeVersion,
    config: { [ROUTE_NAME]: 'd†ev_get_node_version' },
  },

  // -------------------------------------------------------------------------------------------------
  // Accessing thesaurus
  // -------------------------------------------------------------------------------------------------
  {
    description: 'Get every thesaurus',
    method: 'GET',
    url: `${URL_PV_THESAURUS_ACCESS}`,
    handler: getEveryThesaurus,
    config: { [ROUTE_NAME]: 'dev_get_every_thesaurus' },
  },
  {
    description: 'Get a thesaurus from its name/code',
    method: 'GET',
    url: `${URL_PV_THESAURUS_ACCESS}/:${PARAM_THESAURUS_CODE}`,
    handler: getSingleThesaurus,
    config: { [ROUTE_NAME]: 'dev_get_single_thesaurus' },
  },
  {
    description: 'Get a thesaurus from its name in a given language',
    method: 'GET',
    url: `${URL_PV_THESAURUS_ACCESS}/:${PARAM_THESAURUS_CODE}/:${PARAM_THESAURUS_LANG}`,
    handler: getSingleThesaurusLabels,
    config: { [ROUTE_NAME]: 'dev_get_single_thesaurus' },
  },
  /** Init themes with values in stored data */
  {
    description: 'Init themes with values in stored data',
    method: 'GET',
    url: `${URL_PV_THESAURUS_ACCESS}/:${PARAM_THESAURUS_CODE}/${ACT_INIT}`,
    handler: initThemes,
    config: { [ROUTE_NAME]: 'dev_init_themes' },
  },

  {
    description: 'Get every licence',
    method: 'GET',
    url: `${URL_PV_LICENCE_ACCESS}`,
    handler: getAllLicences,
    config: { [ROUTE_NAME]: 'dev_get_all_licences' },
  },
  {
    description: 'Get every licence code',
    method: 'GET',
    url: `${URL_PV_LICENCE_CODES_ACCESS}`,
    handler: getAllLicenceCodes,
    config: { [ROUTE_NAME]: 'dev_get_all_licence_codes' },
  },
  {
    description: 'Init licences',
    method: 'POST',
    url: `${URL_PV_LICENCE_ACCESS}/${ACT_INIT}`,
    handler: initLicences,
    config: { [ROUTE_NAME]: 'dev_init_licences' },
  },

  // -------------------------------------------------------------------------------------------------
  // Init Open Data Rennes
  // -------------------------------------------------------------------------------------------------
  // Mass init with ODS data
  {
    description: 'Populate the DB with old ODS data',
    method: 'POST',
    url: `${URL_PREFIX_PRIVATE}/${OBJ_METADATA}/${ACT_INIT}`,
    handler: initWithODR,
    config: { [ROUTE_NAME]: 'dev_init_with_odr' },
  },

  // -------------------------------------------------------------------------------------------------
  // UUID v4 generation
  // -------------------------------------------------------------------------------------------------
  {
    description: 'Generate a UUID v4',
    method: 'GET',
    url: `${URL_PREFIX_PRIVATE}/${ACT_UUID_GEN}`,
    handler: generateUUID,
    config: { [ROUTE_NAME]: 'dev_generate_uuid' },
  },
  // -------------------------------------------------------------------------------------------------
  // Portal token
  // -------------------------------------------------------------------------------------------------
  // Get a new token from the Portal
  {
    description: 'Get a new token from the Portal',
    method: 'GET',
    url: `${URL_PV_PORTAL_PREFIX}/${URL_SUFFIX_TOKEN_GET}`,
    handler: exposedGetPortalToken,
    config: { [ROUTE_NAME]: 'dev_get_portal_token' },
  },
  // Get a token checked by the Portal
  {
    description: 'Get a token checked by the Portal',
    method: 'GET',
    url: `${URL_PV_PORTAL_PREFIX}/${URL_SUFFIX_TOKEN_GET}/${URL_SUFFIX_TOKEN_CHECK}`,
    handler: checkStoredToken,
    config: { [ROUTE_NAME]: 'dev_check_stored_token' },
  },

  // -------------------------------------------------------------------------------------------------
  // Get/post resources from/to Portal
  // -------------------------------------------------------------------------------------------------
  {
    description: 'Send a list of metadata to the Portal',
    method: 'POST',
    url: `${URL_PV_PORTAL_PREFIX}/${OBJ_METADATA}/${ACT_SEND}`,
    handler: sendManyMetadataToPortal,
    config: { [ROUTE_NAME]: 'dev_send_many_metadata_to_portal' },
  },
  {
    description: 'Get a metadata from the Portal',
    method: 'GET',
    url: `${URL_PV_PORTAL_PREFIX}/${OBJ_METADATA}/:${PARAM_ID}`,
    handler: getMetadata,
    config: { [ROUTE_NAME]: 'dev_get_portal_metadata' },
  },
  {
    description: 'Get every metadata from the Portal (paged)',
    method: 'GET',
    url: `${URL_PV_PORTAL_PREFIX}/${OBJ_METADATA}`,
    handler: getMetadata,
    config: { [ROUTE_NAME]: 'dev_get_portal_metadata' },
  },
  {
    description: 'Send a metadata to the Portal',
    method: 'POST',
    url: `${URL_PV_PORTAL_PREFIX}/${OBJ_METADATA}/:${PARAM_ID}`,
    handler: sendMetadata,
    config: { [ROUTE_NAME]: 'dev_send_metadata_to_portal' },
  },
  {
    description: 'Ask for metadata deletion to the Portal',
    method: 'DELETE',
    url: `${URL_PV_PORTAL_PREFIX}/${OBJ_METADATA}/:${PARAM_ID}`,
    handler: deleteMetadata,
    config: { [ROUTE_NAME]: 'dev_del_portal_metadata' },
  },
  {
    description: 'Get the whole list of metadata stored on the Portal',
    method: 'GET',
    url: `${URL_PREFIX_CHECK}/${URL_SUFFIX_PORTAL}/${OBJ_METADATA}`,
    handler: getPortalCachedMetadataList,
    config: { [ROUTE_NAME]: 'prv_check_portal_metadata' },
  },
  {
    description: 'Get the whole list of metadata IDs stored on the Portal',
    method: 'GET',
    url: `${URL_PREFIX_CHECK}/${URL_SUFFIX_PORTAL}/ids`,
    handler: getPortalMetadataFields,
    config: { [ROUTE_NAME]: 'prv_check_portal_metadata_ids' },
  },
  // -------------------------------------------------------------------------------------------------
  //  Monitoring/control checks on metadata/data
  // -------------------------------------------------------------------------------------------------
  // Get the portal URL associated with this node
  {
    description: 'Get the public URL of this node',
    method: 'GET',
    url: `${URL_PREFIX_CHECK}/${URL_SUFFIX_NODE}/url`,
    handler: () => getPublicUrl(),
    config: { [ROUTE_NAME]: 'dev_check_node_url' },
  },
  {
    description: 'Get the URL of the portal associated with this node',
    method: 'GET',
    url: `${URL_PREFIX_CHECK}/${URL_SUFFIX_PORTAL}/url`,
    handler: getPortalBaseUrl,
    config: { [ROUTE_NAME]: 'dev_check_portal_url' },
  },

  // -------------------------------------------------------------------------------------------------
  // Accessing logs
  // -------------------------------------------------------------------------------------------------
  // Get logs
  {
    description: 'Get logs',
    method: 'GET',
    url: `${URL_PV_LOGS_ACCESS}`,
    handler: getLogs,
    config: { [ROUTE_NAME]: 'dev_get_logs' },
  },
  // {
  //   method: 'GET',
  //   url: `${URL_PV_LOGS_ACCESS}/:${PARAM_LOGS_LINES}`,
  //   handler: getLastLogLines,
  //   config: { [ROUTE_NAME]: 'dev_get_last_log_lines' },
  // },
  // Search logs
  {
    description: 'Search logs',
    method: 'GET',
    url: `${URL_PV_LOGS_ACCESS}/${ACT_SEARCH}`,
    handler: searchLogs,
    config: { [ROUTE_NAME]: 'dev_search_logs' },
  },
  // -------------------------------------------------------------------------------------------------
  // Actions on DB
  // -------------------------------------------------------------------------------------------------
  /** Get all collections */
  {
    description: 'Get every collection name',
    method: 'GET',
    url: `${URL_PV_DB_ACCESS}`,
    handler: getCollections,
    config: { [ROUTE_NAME]: 'dev_get_collections' },
  },
  /** Drop Collection */
  {
    description: 'Drop a collection',
    method: 'DELETE',
    url: `${URL_PV_DB_ACCESS}/:${PARAM_OBJECT}`,
    handler: dropCollection,
    config: { [ROUTE_NAME]: 'dev_drop_collection' },
  },
  /** Drop DB = delete all collections! */
  {
    description: 'Drop every collection',
    method: 'DELETE',
    url: `${URL_PV_DB_ACCESS}`,
    handler: dropDB,
    config: { [ROUTE_NAME]: 'dev_drop_db' },
  },
  /** Dump DB = save collections in a zip file */
  {
    description: 'Save the mongo DB collections in a zip file',
    method: 'POST',
    url: `${URL_PV_DB_ACCESS}/dump`,
    handler: dumpDB,
    config: { [ROUTE_NAME]: 'dev_db_dump' },
  },
  /** Dump DB = restore collections from a local zip file */
  {
    description: 'Restore the mongo DB collections from a local zip file',
    method: 'POST',
    url: `${URL_PV_DB_ACCESS}/restore`,
    handler: restoreDB,
    config: { [ROUTE_NAME]: 'dev_db_restore' },
  },
  // -------------------------------------------------------------------------------------------------
  // Tests entry
  // -------------------------------------------------------------------------------------------------
  {
    description: 'Test the availability of the microservice',
    method: 'GET',
    url: `${URL_PREFIX_PRIVATE}/test`,
    handler: test,
    config: { [ROUTE_NAME]: 'dev_test' },
  },
]

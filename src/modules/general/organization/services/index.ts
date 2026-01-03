/**
 * General > Organization services barrel.
 *
 * This module is the frontend equivalent of the backend package:
 *   dz.sh.trc.hyflo.general.organization
 *
 * For backward-compatibility, these services currently re-export the
 * implementations located under common/administration.
 */

export { stateService, localityService } from '../../../common/administration/services';

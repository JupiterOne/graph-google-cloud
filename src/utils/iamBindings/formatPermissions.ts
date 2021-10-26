import { mapValues } from 'lodash';

export function formatPermissions(permissions: string[]): {
  [k: string]: string[];
} {
  return mapValues(
    permissions.reduce((map, permission) => {
      const splitPermission = permission.split('.');
      const accessLevel = splitPermission.pop();
      /**
       * HACK: to remove all "/" characters in permissions. Some Google Cloud permissions are shaped like urls.
       * Unfortunately, JupiterOne can not handle entity properties with "/" characters in them. To fix this,
       * we are turning "/" into "." for permission property names.
       * ex: cloudonefs.isiloncloud.com/clusters => cloudonefs.isiloncloud.com.clusters
       */
      const permisisonLocation = splitPermission.join('.').split('/').join('.');
      if (accessLevel) {
        map[accessLevel] instanceof Set
          ? map[permisisonLocation].add(accessLevel)
          : (map[permisisonLocation] = new Set([accessLevel]));
      }
      return map;
    }, {}),
    (set) => Array.from(set),
  );
}

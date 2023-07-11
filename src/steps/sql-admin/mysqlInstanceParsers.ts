import { sqladmin_v1beta4 } from 'googleapis';

const parseHasRootPassword = (
  data: sqladmin_v1beta4.Schema$DatabaseInstance,
) => {
  return data.rootPassword !== undefined && data.rootPassword !== null;
};

export const mysqlInstanceParser = {
  parseHasRootPassword,
};

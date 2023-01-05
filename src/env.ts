import { envsafe, str } from "envsafe";

export const env = envsafe({
  ACCESS_KEY: str(),
  SECRET_KEY: str(),
  BUCKET: str(),
  NAME_PREFIX: str(),
  BACKUP_DATABASE_URL: str({
    desc: 'The connection string of the database to backup.'
  }),
  BACKUP_CRON_SCHEDULE: str({
    desc: 'The cron schedule to run the backup on.',
    default: '0 5 * * *',
    allowEmpty: true
  }),
})

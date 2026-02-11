import { HomeIcon } from '@heroicons/react/24/outline';
import DashboardsIcon from 'assets/dualicons/dashboards.svg?react'
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'
import { getRoleId } from 'utils/auth'

const ROOT_MASTER = '/master'
const roleId = getRoleId()

export const dashboards =
  roleId === 1
    ? {
        id: 'master',
        type: NAV_TYPE_ROOT,
        path: '/master',
        title: 'Master',
        transKey: 'nav.master.master',
        Icon: DashboardsIcon,
        childs: [
          {
            id: 'master.users',
            path: `${ROOT_MASTER}/users`,
            type: NAV_TYPE_ITEM,
            title: 'Master User',
            transKey: 'nav.master.users',
            Icon: HomeIcon,
          },
          {
            id: 'master.subject',
            path: `${ROOT_MASTER}/subject`,
            type: NAV_TYPE_ITEM,
            title: 'Subject',
            transKey: 'nav.master.subject',
            Icon: HomeIcon,
          },
          {
            id: 'master.class',
            path: `${ROOT_MASTER}/class`,
            type: NAV_TYPE_ITEM,
            title: 'Class',
            transKey: 'nav.master.class',
            Icon: HomeIcon,
          },
          {
            id: 'master.room',
            path: `${ROOT_MASTER}/room`,
            type: NAV_TYPE_ITEM,
            title: 'Room',
            transKey: 'nav.master.room',
            Icon: HomeIcon,
          },
          {
            id: 'master.siswa',
            path: `${ROOT_MASTER}/siswa`,
            type: NAV_TYPE_ITEM,
            title: 'Siswa',
            transKey: 'nav.master.siswa',
            Icon: HomeIcon,
          },
          {
            id: 'master.teacher',
            path: `${ROOT_MASTER}/teacher`,
            type: NAV_TYPE_ITEM,
            title: 'Teacher',
            transKey: 'nav.master.teacher',
            Icon: HomeIcon,
          },
        ],
      }
    : null
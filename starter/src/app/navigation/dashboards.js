import { HomeIcon } from '@heroicons/react/24/outline';
import DashboardsIcon from 'assets/dualicons/dashboards.svg?react'
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'
import { getRoleId } from 'utils/auth'

const ROOT_MASTER = '/master'
const roleId = getRoleId()

export const dashboards = (roleId === 1 || roleId === 2)
  ? {
      id: 'dashboards',
      type: NAV_TYPE_ROOT,
      path: '/dashboards',
      title: 'Dashboards',
      Icon: DashboardsIcon,
      childs: [
        {
          id: 'dashboards.home',
          path: '/dashboards/home',
          type: NAV_TYPE_ITEM,
          title: 'Home',
          Icon: HomeIcon,
        },
      ],
    }
  : null;

export const master_admin =
  roleId === 1
    ? {
        id: 'master',
        type: NAV_TYPE_ROOT,
        path: '/master',
        title: 'Master Data',
        Icon: DashboardsIcon,
        childs: [
          {
            id: 'master.users',
            path: `${ROOT_MASTER}/users`,
            type: NAV_TYPE_ITEM,
            title: 'Master User',
            Icon: HomeIcon,
          },
          {
            id: 'master.subject',
            path: `${ROOT_MASTER}/subject`,
            type: NAV_TYPE_ITEM,
            title: 'Subject',
            Icon: HomeIcon,
          },
          {
            id: 'master.class',
            path: `${ROOT_MASTER}/class`,
            type: NAV_TYPE_ITEM,
            title: 'Class',
            Icon: HomeIcon,
          },
          {
            id: 'master.room',
            path: `${ROOT_MASTER}/room`,
            type: NAV_TYPE_ITEM,
            title: 'Room',
            Icon: HomeIcon,
          },
          {
            id: 'master.siswa',
            path: `${ROOT_MASTER}/siswa`,
            type: NAV_TYPE_ITEM,
            title: 'Siswa',
            Icon: HomeIcon,
          },
          {
            id: 'master.teacher',
            path: `${ROOT_MASTER}/teacher`,
            type: NAV_TYPE_ITEM,
            title: 'Teacher',
            Icon: HomeIcon,
          },
        ],
      }
    : null;
// Import Dependencies
import { Navigate } from "react-router";

// Layouts
import { AppLayout } from "app/layouts/AppLayout";
import { DynamicLayout } from "app/layouts/DynamicLayout";


// Middleware
import AuthGuard from "middleware/AuthGuard";
import MasterGuard from "middleware/MasterGuard";
import TeacherGuard from "middleware/TeacherGuard";

// ----------------------------------------------------------------------

const protectedRoutes = {
  id: "protected",
  Component: AuthGuard,
  children: [

    // =========================
    // MAIN DASHBOARD AREA
    // =========================
    {
      Component: DynamicLayout,
      children: [

        // ROOT
        {
          index: true,
          element: <Navigate to="/dashboards/home" />,
        },

        // =========================
        // DASHBOARDS
        // =========================
        {
          path: "dashboards",
          children: [
            {
              index: true,
              element: <Navigate to="/dashboards/home" />,
            },
            {
              path: "home",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/home")).default,
              }),
            },
          ],
        },

        // =========================
        // MASTER (ADMIN ONLY)
        // =========================
        {
          path: "master",
          element: <MasterGuard />,
          children: [
            {
              index: true,
              element: <Navigate to="/master/users" />,
            },
            {
              path: "users",
              lazy: async () => ({
                Component: (await import("app/pages/users/UserPage")).default,
              }),
            },
            {
              path: "subject",
              lazy: async () => ({
                Component: (await import("app/pages/subjects/SubjectPage")).default,
              }),
            },
            {
              path: "class",
              lazy: async () => ({
                Component: (await import("app/pages/class/ClassPage")).default,
              }),
            },
            {
              path: "room",
              lazy: async () => ({
                Component: (await import("app/pages/room/RoomPage")).default,
              }),
            },
            {
              path: "siswa",
              lazy: async () => ({
                Component: (await import("app/pages/siswa/SiswaPage")).default,
              }),
            },
            {
              path: "teacher",
              lazy: async () => ({
                Component: (await import("app/pages/teacher/TeacherPage")).default,
              }),
            },
            {
              path: "question",
              lazy: async () => ({
                Component: (await import("app/pages/user/ExamPage")).default,
              }),
            },
          ],
        },

        {
          path: "exam",
          element: <MasterGuard />,
          children: [
            {
              index: true,
              element: <Navigate to="/teacher/exam" />,
            },
            {
              path: "list",
              lazy: async () => ({
                Component: (await import("app/pages/exam/AddExamPage")).default,
              }),
            },
            {
              path: "question-bank/:headerid",
              lazy: async () => ({
                Component: (await import("app/pages/teacher/QuestionList")).default,
              }),
            },
            {
              path: ":id",
              lazy: async () => ({
                Component: (await import("app/pages/exam/ExamBuilderPage")).default,
              }),
            },

          ],
        },

        // =========================
        // TEACHER AREA
        // =========================
        {
          path: "teacher",
          element: <TeacherGuard />, // kalau nanti mau RBAC teacher
          children: [
            {
              index: true,
              element: <Navigate to="/teacher/exam" />,
            },
            {
              path: "exam",
              lazy: async () => ({
                Component: (await import("app/pages/teacher/QuestionBank")).default,
              }),
            },
            {
              path: "question-bank/:headerid",
              lazy: async () => ({
                Component: (await import("app/pages/teacher/QuestionList")).default,
              }),
            }

          ],
        },

      ],
    },

    // =========================
    // SETTINGS AREA (Different Layout)
    // =========================
    {
      Component: AppLayout,
      children: [
        {
          path: "settings",
          lazy: async () => ({
            Component: (await import("app/pages/settings/Layout")).default,
          }),
          children: [
            {
              index: true,
              element: <Navigate to="/settings/general" />,
            },
            {
              path: "general",
              lazy: async () => ({
                Component: (
                  await import("app/pages/settings/sections/General")
                ).default,
              }),
            },
            {
              path: "appearance",
              lazy: async () => ({
                Component: (
                  await import("app/pages/settings/sections/Appearance")
                ).default,
              }),
            },
          ],
        },
      ],
    },

  ],
};

export { protectedRoutes };

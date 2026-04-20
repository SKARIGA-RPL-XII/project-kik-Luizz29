// Import Dependencies
import { Navigate } from "react-router";
import { StudentLayout } from "app/layouts/StudentLayout";

// Layouts
import { AppLayout } from "app/layouts/AppLayout";
import { DynamicLayout } from "app/layouts/DynamicLayout";


// Middleware
import AuthGuard from "middleware/AuthGuard";
import MasterGuard from "middleware/MasterGuard";
import TeacherGuard from "middleware/TeacherGuard";

// ----------------------------------------------------------------------

import { useAuthContext } from "app/contexts/auth/context";

const HomeRedirect = () => {
  const { user } = useAuthContext();
  if (Number(user?.role?.roleid) === 3) {
    return <Navigate to="/student/dashboard" replace />;
  }
  return <Navigate to="/dashboards/home" replace />;
};

const protectedRoutes = {
  id: "protected",
  Component: AuthGuard,
  children: [

    // =========================
    // STUDENT AREA (NO SIDEBAR)
    // =========================  
    {
      path: "student",
      Component: StudentLayout,

      children: [
        {
          path: "dashboard",
          lazy: async () => ({
            Component: (await import("app/pages/student/DashboardPage")).default,
          }),
        },

        // ⭐ ROUTE EXAM
        {
          path: "exam/:examID",
          lazy: async () => ({
            Component: (await import("app/pages/student/ExamPage")).default,
          }),
        },
        {
          path: "exam/:examID/result",
          lazy: async () => ({
            Component: (await import("app/pages/student/ExamResultPage")).default,
          }),
        },
      ],
    },


    // =========================
    // INDEX REDIRECT
    // =========================
    {
      index: true,
      element: <HomeRedirect />,
    },

    // =========================
    // ADMIN + TEACHER AREA (SIDEBAR)
    // =========================
    {
      Component: DynamicLayout,
      children: [

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

        // ===== MASTER ADMIN =====
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
          ],
        },

        // ===== EXAM =====
        {
          path: "exam",
          element: <MasterGuard />,
          children: [
            {
              path: "list",
              lazy: async () => ({
                Component: (await import("app/pages/exam/AddExamPage")).default,
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

        // ===== TEACHER =====
        {
          path: "teacher",
          element: <TeacherGuard />,
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
              path: "assigned-exams",
              lazy: async () => ({
                Component: (await import("app/pages/teacher/AssignedExams")).default,
              }),
            },


            // ✅ TAMBAHKAN INI
            {
              path: "question-bank/:headerid",
              lazy: async () => ({
                Component: (await import("app/pages/teacher/QuestionList")).default,
              }),
            },
            // ✅ TAMBAHKAN INI
            {
              path: "manage-question-exam/:id",
              lazy: async () => ({
                Component: (await import("app/pages/teacher/ManageExamQuestion")).default,
              }),
            },
          ],
        }


      ],
    },

    // =========================
    // SETTINGS (APP LAYOUT)
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

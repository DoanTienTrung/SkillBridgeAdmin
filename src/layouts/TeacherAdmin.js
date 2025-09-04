// Cập nhật file layouts/TeacherAdmin.js

import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// components
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import TeacherSidebar from "components/Sidebar/TeacherSidebar.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";

// guards
import TeacherRoute from "components/Guards/TeacherRoute.js";

// Teacher-specific views
import TeacherDashboard from "views/teacher/Dashboard.js";
import TeacherStudentManagement from "views/teacher/StudentManagement.js";

// Shared admin views (Teacher có thể truy cập)
import ProfileManagement from "views/admin/ProfileManagement.js";
import StudentReports from "views/admin/StudentReports.js";
import LessonTypeSelector from "views/admin/LessonTypeSelector.js";
import CreateListeningLesson from "views/admin/CreateListeningLesson.js";
import CreateReadingLesson from "views/admin/CreateReadingLesson.js";
import LessonManagement from "views/admin/LessonManagement.js";
import Settings from "views/admin/Settings.js";

export default function TeacherAdmin() {
  return (
    <>
      <TeacherSidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <AdminNavbar />
        <div className="px-4 md:px-10 mx-auto w-full mt-6">
          <Switch>
            {/* Teacher Dashboard */}
            <TeacherRoute path="/teacher/dashboard" exact component={TeacherDashboard} />
            
            {/* Student Management - Teacher Version */}
            <TeacherRoute path="/teacher/students" exact component={TeacherStudentManagement} />
            
            {/* Student Reports (shared with Admin) */}
            <TeacherRoute path="/teacher/reports" exact component={StudentReports} />
            
            {/* Profile Management */}
            <TeacherRoute path="/teacher/profile" exact component={ProfileManagement} />

            {/* Lesson Creation Workflow */}
            <TeacherRoute path="/teacher/create-lesson" exact component={LessonTypeSelector} />
            <TeacherRoute path="/teacher/create-listening" exact component={CreateListeningLesson} />
            <TeacherRoute path="/teacher/create-reading" exact component={CreateReadingLesson} />

            {/* Lesson Management */}
            <TeacherRoute path="/teacher/lessons" exact component={LessonManagement} />

            {/* Settings */}
            <TeacherRoute path="/teacher/settings" exact component={Settings} />

            {/* Default redirect */}
            <Redirect from="/teacher" to="/teacher/dashboard" />
          </Switch>
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
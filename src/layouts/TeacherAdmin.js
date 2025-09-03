// Cập nhật file layouts/TeacherAdmin.js

import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// components
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import TeacherSidebar from "components/Sidebar/TeacherSidebar.js";
//import HeaderStats from "components/Headers/HeaderStats.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";

// guards
import TeacherRoute from "components/Guards/TeacherRoute.js";

// views
import TeacherDashboard from "views/admin/TeacherDashboard.js";
import ProfileManagement from "views/admin/ProfileManagement.js";


// THÊM IMPORT MỚI
import LessonTypeSelector from "views/admin/LessonTypeSelector.js";
import CreateListeningLesson from "views/admin/CreateListeningLesson.js";
import CreateReadingLesson from "views/admin/CreateReadingLesson.js";
import LessonManagement from "views/admin/LessonManagement.js";

import Maps from "views/admin/Maps.js";
import Settings from "views/admin/Settings.js";
import Tables from "views/admin/Tables.js";

export default function TeacherAdmin() {
  return (
    <>
      <TeacherSidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <AdminNavbar />
        <div className="px-4 md:px-10 mx-auto w-full mt-6">
          <Switch>
            {/* Dashboard */}
            <TeacherRoute path="/teacher/dashboard" exact component={TeacherDashboard} />
            <TeacherRoute path="/teacher/profile" exact component={ProfileManagement} />

            {/* Lesson Creation Workflow */}
            <TeacherRoute path="/teacher/create-lesson" exact component={LessonTypeSelector} />
            <TeacherRoute path="/teacher/create-listening" exact component={CreateListeningLesson} />
            <TeacherRoute path="/teacher/create-reading" exact component={CreateReadingLesson} />

            {/* Lesson Management */}
            <TeacherRoute path="/teacher/lessons" exact component={LessonManagement} />

            {/* Other features */}
            <TeacherRoute path="/teacher/students" exact component={Tables} />
            <TeacherRoute path="/teacher/reports" exact component={Maps} />
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
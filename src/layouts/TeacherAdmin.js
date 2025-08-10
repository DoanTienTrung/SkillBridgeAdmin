import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// components
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import TeacherSidebar from "components/Sidebar/TeacherSidebar.js";
import HeaderStats from "components/Headers/HeaderStats.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";

// guards
import AdminRoute from "components/Guards/AdminRoute.js";

// views
import TeacherDashboard from "views/admin/TeacherDashboard.js";
import ProfileManagement from "views/admin/ProfileManagement.js";
import AudioUploadTest from "views/admin/AudioUploadTest.js";
import CreateListeningLesson from "views/admin/CreateListeningLesson.js";
import Maps from "views/admin/Maps.js";
import Settings from "views/admin/Settings.js";
import Tables from "views/admin/Tables.js";

export default function TeacherAdmin() {
  return (
    <>
      <TeacherSidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <AdminNavbar />
        {/* Header */}
        <HeaderStats />
        <div className="px-4 md:px-10 mx-auto w-full -m-24">
          <Switch>
            {/* Protected routes for teachers and admins */}
            <AdminRoute path="/admin/dashboard" exact component={TeacherDashboard} />
            <AdminRoute path="/admin/profile" exact component={ProfileManagement} />
            <AdminRoute path="/admin/test-upload" exact component={AudioUploadTest} />
            <AdminRoute path="/admin/create-listening" exact component={CreateListeningLesson} />
            <AdminRoute path="/admin/lessons" exact component={Tables} />
            <AdminRoute path="/admin/students" exact component={Tables} />
            <AdminRoute path="/admin/reports" exact component={Maps} />
            <AdminRoute path="/admin/settings" exact component={Settings} />
            
            {/* Default redirect */}
            <Redirect from="/admin" to="/admin/dashboard" />
          </Switch>
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}

import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// components
import StudentNavbar from "components/Navbars/StudentNavbar.js";
import StudentSidebar from "components/Sidebar/StudentSidebar.js";
import FooterAdmin from "components/Footers/FooterAdmin.js";

// views
import StudentDashboard from "views/student/StudentDashboard.js";
import LessonList from "views/student/LessonList.js";
import ListeningLesson from "views/student/ListeningLesson.js";
import ReadingLesson from "views/student/ReadingLesson.js";
import VocabularyManager from "views/student/VocabularyManager.js";
import ProgressTracker from "views/student/ProgressTracker.js";
import QuizInterface from "views/student/QuizInterface.js";
import ProfileManagement from "views/admin/ProfileManagement";
export default function Student() {
  return (
    <>
      <StudentSidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <StudentNavbar />

        {/* Main content area */}
        <div className="relative">
          <Switch>
            <Route path="/student/dashboard" exact component={StudentDashboard} />
            <Route path="/student/lessons" exact component={LessonList} />
            <Route path="/student/listening/:id" component={ListeningLesson} />
            <Route path="/student/reading/:id" component={ReadingLesson} />
            <Route path="/student/quiz/:lessonId" component={QuizInterface} />
            <Route path="/student/vocabulary" component={VocabularyManager} />
            <Route path="/student/progress" component={ProgressTracker} />
            <Route path="/student/profile" exact component={ProfileManagement} />
            {/* TODO: Add more student routes here later */}
            <Redirect from="/student" to="/student/dashboard" />
          </Switch>
        </div>

        <FooterAdmin />
      </div>
    </>
  );
}

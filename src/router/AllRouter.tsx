import { Routes, Route } from "react-router-dom";
import Login from "@/AllComponents/Login";
import SignUp from "@/AllComponents/SignUp";
import Dashboard from "@/AllComponents/Dashboard";
import PageNotFound from "@/AllComponents/PageNotFound";
import PrivateRouter from "@/router/PrivateRouter";

function AllRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />


      <Route
        path="/"
        element={
          <PrivateRouter>
            <Dashboard /> 
          </PrivateRouter>
        }
      />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default AllRouter;

import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const PrivateRoute = (props) => {
  const user = useSelector((state) => state?.user?.user);
  const loading = useSelector((state) => state.user.loading);
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user || !user.id || (location.pathname.startsWith("/admin/messages") && (user.roleName !== "ROLE_ADMIN" && user.roleName !== "ROLE_STAFF"))) {
    return <Navigate to="/login" replace />;
  }
  return <>{props.children}</>;
};

export default PrivateRoute;

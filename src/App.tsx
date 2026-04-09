import { RouterProvider } from "react-router-dom";
import { router } from "./router/app.router";
import { useAuth } from "./auth/useAuth";
import { useAppDispatch, useAppSelector } from "./store/redux.hooks";
import { useEffect } from "react";
import { loadUserInfo, startUserSync, syncUserFailed } from "./store/slices/auth.slice";
import { authApi } from "./services/auth-api.service";
import { ToastContainer } from "react-toastify";

function App() {
  const dispatch = useAppDispatch();
  const { isUserSynced } = useAppSelector((state) => state.auth);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const syncUserData = async () => {

      if (isAuthenticated && !isUserSynced) {
        try {
          dispatch(startUserSync());

          const response = await authApi.me();
          dispatch(loadUserInfo({
            user: response,
          }));
        } catch (error) {
          console.error('Failed to sync user data:', error);
          dispatch(syncUserFailed());
        }
      }

    };

    syncUserData();
  }, [isAuthenticated, isUserSynced, dispatch]);

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer 
        position="top-right" 
        style={{ top: '80px', zIndex: 99999 }}
        autoClose={3000} 
      />
    </>
  );
}

export default App;

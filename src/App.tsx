import { RouterProvider } from "react-router-dom";
import { router } from "./router/app.router";
import { useAuth } from "./auth/useAuth";
import { useAppDispatch, useAppSelector } from "./store/redux.hooks";
import { useEffect } from "react";
import type { UserRes } from "./models/entity.model";
import { loadUserInfo } from "./store/slices/auth.slice";
import { startUserSync } from "./store/slices/auth.slice";
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
          console.log('User data synced successfully');
        } catch (error) {
          console.error('Failed to sync user data:', error);
          dispatch(loadUserInfo({
            user: null as unknown as UserRes,
          }));
        }
      }

    };

    syncUserData();
  }, [isAuthenticated, isUserSynced, dispatch]);

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;

import React from "react";
import { useRouteError } from "react-router-dom";

const ErrorPage: React.FC = () => {
    //#region States
    const error: any = useRouteError();
    //#endregion

    //#region Effects
    console.error(error);
    //#endregion

    //#region Render
    return (
        <div id="error-page" className="text-center mt-[50px]">
            <h1>Oops!</h1>
            <p>Sorry, an unexpected error has occurred.</p>
            <p>
                <i>{error.statusText || error.message}</i>
            </p>
        </div>
    );
    //#endregion
};

export default ErrorPage;

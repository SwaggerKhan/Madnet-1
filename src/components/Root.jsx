import React, { useState } from 'react';
import { IonRouterOutlet, IonSplitPane, IonPage, IonLoading } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route, useLocation } from 'react-router-dom';
import { createBrowserHistory } from "history"
import { authContext } from "../contexts/AuthContext";
import { appContext } from "../contexts/AppContext";
import { volunteerPages, fellowPages } from "../utils/Menu"

import Menu from './Menu';
import Page from '../pages/Page';
import Login from "../pages/Login";
import Dashboard from '../pages/Dashboard';
import Shelters from '../pages/Shelters';
import ManageShelter from '../pages/ManageShelter';

const history = createBrowserHistory()

const Root = () => {
    const { loading, setLoading } = React.useContext(appContext);

    const allPages = volunteerPages.concat(fellowPages);

    return (
        <IonReactRouter history={history}>
            <SetPage />
            <IonSplitPane contentId="main">
                <Menu />
                <IonPage id="main">
                    <IonLoading
                        isOpen={loading}
                        onDidDismiss={() => setLoading(false)}
                        message={'Loading...'}
                        duration={3000}
                    />

                    <IonRouterOutlet id="main">
                        <Route path="/login">
                            <Login />
                        </Route>

                        <PrivateRoute path="/page/Dashboard">
                            <Dashboard />
                        </PrivateRoute>

                        <PrivateRoute path="/page/Shelters/:shelter_id">
                            <ManageShelter />
                        </PrivateRoute>

                        <PrivateRoute path="/page/Shelters">
                            <Shelters />
                        </PrivateRoute>
                        <PrivateRoute path="/page/MyClasses">
                            <Page page={{name: "My Classes"}} />
                        </PrivateRoute>

                        <Route path="/" render={() => <Redirect to="/page/Dashboard" /> } exact={true} />
                    </IonRouterOutlet>
              </IonPage>
            </IonSplitPane>
        </IonReactRouter>
    );
}

// A wrapper for <Route> that redirects to the login screen if you're not yet authenticated.
function PrivateRoute({ children, ...rest }) {
    const { auth } = React.useContext(authContext);

    return (
        <Route {...rest}
            render={() =>
                auth.id ? ( children ) : ( <Redirect to={{ pathname: "/login" }} /> )
            } />
    );
}

function SetPage() { // Why not put this code in the Root itself? Because this has to be inside the Router componet to work. Otherwise it gives a can't find useContext error.
    const { setData } = React.useContext(appContext);

    let location = useLocation();
    setData("path", location.pathname)

    return null
}

export default Root;

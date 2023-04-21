import React from 'react';
import { Navigate } from 'react-router-dom';
import { authenticatedState } from '../../../atoms/Auth/AuthAtoms';
import { useRecoilState } from 'recoil';
import axios from 'axios';
import { useQuery } from 'react-query';
import { getAuthenticated } from '../../../api/auth/authApi';

const validatedToken = async(accessToken) => {
    const response = await axios.get("http://localhost:8080/auth/authenticated",{params: {accessToken}});
    return response.data;
}

const AuthRoute = ({ path,element }) => {
    const accessToken = localStorage.getItem("accessToken");
    const [authenticated, setAuthenticated] = useRecoilState(authenticatedState)
    const { data } = useQuery(()=> getAuthenticated(accessToken));
    setAuthenticated(data);
    const permitAll = ["/login","/register","/password/forgot"];

    if(!authenticated) {
        
        if(accessToken !== null) {
            validatedToken(accessToken).then((flag)=> {
                setAuthenticated(flag);
            });
            if(authenticated) {
                return element;
            }
            console.log("페이지 이동 테스트");
            return <Navigate to={path} />
        } 
        if(permitAll.includes(path)) {
            return element;
        }
        return <Navigate to="/login" />;
    }
    if(permitAll.includes(path)) {
        return <Navigate to="/" />;
    }

    return element;
};


export default AuthRoute;
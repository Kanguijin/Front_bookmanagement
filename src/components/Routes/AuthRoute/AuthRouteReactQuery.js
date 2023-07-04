import axios from 'axios';
import React, { useEffect } from 'react';
import { useQueries, useQuery } from 'react-query';
import { Navigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { refreshState } from '../../../atoms/Auth/AuthAtoms';

// 새 창을 열었을 때나 새로고침한 경우에 토큰인증을 해주기 위해서
const AuthRouteReactQuery = ({ path,element }) => {
    const [refresh, setRefresh] = useRecoilState(refreshState); 
    const { data, isLoading } = useQuery(["authenticated"], async () => {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get("http://localhost:8080/auth/authenticated", {params:{accessToken}});
        return response;
    }, {
        enabled: refresh
    });

    // 키 값을 배열에 넣어주는 것이 정석. 키 값 여러개 가능
    const principal = useQuery(["principal"], async () => {
        const accessToken = localStorage.getItem("accessToken");
        // 해당 값이 fresh 한지 안한지 체크. 받은 값이 다르면 상태를 바꾸어 재랜더링해준다.-> 자동
        const response = await axios.get("http://localhost:8080/auth/principal", {params:{accessToken}})
        return response;
    },{
        enabled: !!localStorage.getItem("accessToken")
    });

    useEffect(()=> {
        if(!refresh) {
            setRefresh(true);
        }
    }, [refresh]);

    //  로딩
    if(isLoading) {
        return (<div>로딩중...</div>)
    }

    if(principal.data !== undefined) {
        const roles = principal.data.data.authorities.split(",");
        if(path.startsWith("/admin") && !roles.includes("ROLE_ADMIN")) {
            alert("접근 권한이 없습니다.");
            return <Navigate to="/" />
        }
    }

    // 로딩이 끝난 지점.
    if(!isLoading) {
        const permitAll = ["/login","/register","/password/forgot"];

        // 인증이 안된 상태 -> 로그인으로 보냄
        if(!data.data) {
            if(permitAll.includes(path)) {
                return element;
            }
            return <Navigate to="/login" />;
        }

        // 로그인이 된 상태에서 permitAll에 포함된 주소-> 홈
        if(permitAll.includes(path)) {
            return <Navigate to="/" />;
        }

        return element;
    }

    return element;    
};


export default AuthRouteReactQuery;
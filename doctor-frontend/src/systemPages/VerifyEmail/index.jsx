import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory, withRouter} from "react-router-dom";

import {LoadingOutlined} from "@ant-design/icons";

import {verifyEmail} from "../../redux/email";

import logo from "../../assest/Ikemen_staff.png";
import "./style.css";

const VerifyEmail = props => {
    const {isLoad} = useSelector(state => state.ui);
    const verifyStatus = useSelector(state => state.email.verifyEmail);

    const tokenMail = props.match.params?.token;

    const history = useHistory();
    const dispatch = useDispatch();

    const redirectToHomepage = () => {
        history.replace("/");
    };

    useEffect(() => {
        if (tokenMail) {
            dispatch(verifyEmail(tokenMail));
        }else{
            history.replace("/404");    //to NoMatch page
        }
    }, []);

    return (
        <div className="verify-email-page">
            <div className="verify-email-logo" onClick={() => redirectToHomepage()}>
                <img alt="logo" src={logo} />
            </div>
            <div className="verify-email-wrapper">
                <div>
                    {isLoad ? (
                        <>
                            <div className="verify-email-img">
                                <img src="https://img.icons8.com/cotton/100/000000/-message-exchange.png" />
                            </div>
                            <div className="verify-email-msg">
                                <LoadingOutlined /> Đang gửi yêu cầu...
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="verify-email-img">
                                <img
                                    src={
                                        verifyStatus === true
                                            ? "https://img.icons8.com/cotton/100/000000/like-message.png"
                                            : "https://img.icons8.com/cotton/100/000000/mail-error.png"
                                    }
                                />
                            </div>
                            {verifyStatus === true ? (
                                <>
                                    <div className="verify-email-title">Đã xác thực Email của bạn!</div>
                                    <div>Những cập nhật, thông báo mới nhất sẽ được gửi đến Email của bạn.</div>
                                </>
                            ) : (
                                <>
                                    <div className="verify-email-title verify-email-error">{verifyStatus ?? "Có lỗi khi xác thực Email"}</div>
                                    <div>{!verifyStatus ? "Xin hãy vào lại link trong Email, hoặc liên hệ với bộ phận hỗ trợ" : ""}</div>
                                </>
                            )}
                        </>
                    )}
                </div>
                <div className="verify-email-to-login">
                    <button disabled={isLoad} className="recovery-button" onClick={() => redirectToHomepage()}>
                        Đến trang đăng nhập
                    </button>
                </div>
            </div>
        </div>
    );
};

export default withRouter(VerifyEmail);

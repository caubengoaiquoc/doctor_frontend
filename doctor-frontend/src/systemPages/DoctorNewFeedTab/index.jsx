import React, { useState, useEffect } from 'react';
import './style.css';
import Tab from './Tabs';
import { useDispatch, useSelector } from 'react-redux';
import {
    doctorAcceptPackage,
    doctorRejectPackage,
    nextNotAssignPackageQuery,
    notAssignPackageQuery,
    nextAssignPackageQuery,
    assignPackageQuery
} from '../../redux/package';
import { ArrowRightOutlined, LoadingOutlined, SortDescendingOutlined, DownOutlined } from '@ant-design/icons';
import { getDoctorLogin } from '../../redux/doctor';
import { Input, Spin } from 'antd';
import { Menu, Dropdown, Button } from 'antd';
import _ from "lodash";
import moment from 'moment';
import Navbar from '../../components/Navbar';
import { Popconfirm, message, Popover } from 'antd';
import { Tabs } from 'antd';
import { Radio } from 'antd';
import { Link } from 'react-router-dom';
import {
    getPatientInfo
} from '../../redux/patient';
import Patient from '../../components/Patient';

const sortStatus = {
    status :[
        {
            id : "created_at",
            msg: "Ngày taọ yêu cầu"
        },
        {
            id : "date",
            msg: "Ngày thực hiện yêu cầu"
        }
    ]
}

const searchStatus = {
    status :[
        {
            id : "name",
            msg: "Tên"
        },
        {
            id : "address",
            msg: "Địa chỉ"
        }
    ]
}

const { Search } = Input;
const DoctorNewFeedTab = (props) => {

    const [active, setActive] = useState('a');
    const dispatch = useDispatch();
    const { currentDoctor } = useSelector(state => state.doctor);
    // const { token } = useSelector(state => state.auth);
    // const { assignPackage } = useSelector(state => state.package);
    const { notAssignPackage } = useSelector(state => state.package);


    const { assignPackage } = useSelector(state => state.package);
    const { packageAcceptUpdated } = useSelector(state => state.package);
    const { packageRejectUpdated } = useSelector(state => state.package);
    // const { allAppointmentByPackage } = useSelector(state => state.package);

    const { isOutOfDataAssign } = useSelector(state => state.package)
    const { isOutOfDataNotAssign } = useSelector(state => state.package)
    const { isLoad } = useSelector(state => state.ui);
    const [disableButton, setdisableButton] = useState(false);
    const [pageNotAssign, setPageNotAssign] = useState(1);
    const [pageAssign, setPageAssign] = useState(1);
    const [query, setquery] = useState({});
    const [textSearch, setTextSearch] = useState('');
    const [sortBy, setSortBy] = useState("created_at");
    const [searchBy, setSearchBy] = useState("name");
    // const [redirect, setRedirect] = useState(false);

    const [rejectText, setRejectText] = useState("");

    const [packageAddress, setPackageAddress] = useState("");
    const [visible, setVisible] = useState(false);
    const auth = useSelector(state => state.auth);

    useEffect(()=>{
        if(currentDoctor?.id)
            handleSearchAndSort(textSearch, sortBy, searchBy);
    },[currentDoctor])

    useEffect(() => {
        
        if(currentDoctor?.id)
            handleSearchAndSort(textSearch, sortBy, searchBy);
        
    }, [active]);

    const onClickOnNotAssign = (value) => {
        
        const info = notAssignPackage?.filter((info, key) => {
            if (key === value)
                return info;
        });
        dispatch(doctorAcceptPackage(currentDoctor?.id, info[0].package_id));
        setActive(active);
    }

    const acceptOnAssign = (value) => {
        
        const info = assignPackage?.filter((info, key) => {
            if (key === value)
                return info;
        });
        dispatch(doctorAcceptPackage(currentDoctor?.id, info[0].package_id));
        setActive(active);
    }

    const rejectOnAssign = (value) => {

        const info = assignPackage?.filter((info, key) => {
            if (key === value)
                return info;
        });
        dispatch(doctorRejectPackage(currentDoctor?.id, info[0]?.package_id, rejectText));
        setActive(active);
    }

    const rejectOnAssignDuplicated = (value) => {
        
        const info = assignPackage?.filter((info, key) => {
            console.log(key);
            if (key === value)
                return info;
        });
        dispatch(doctorRejectPackage(currentDoctor?.id, info[0]?.package_id, rejectText));
        setActive(active);
        // const timer = setTimeout(() => window.location.reload(), 1000);
        // return () => clearTimeout(timer);
    }

    const handleSearchByChange = ((key) => {
        let search = key.key;
        setSearchBy(search);
        handleSearchAndSort(textSearch, sortBy, search);

    });

    const handleSortByChange = ((key) => {
        let sort = key.key;
        setSortBy(sort);
        handleSearchAndSort(textSearch, sort, searchBy);

    });
    const onChange = (e) => {
        setTextSearch(e.target.value) // store search value
    }

    const onChangeRejectText = (e) => {
        setRejectText(e.target.value);
    }

    const handleSearchEnter = (value) => {
        handleSearchAndSort(value, sortBy, searchBy);
    }

    const handleSearchAndSort = ((value, sortBy, searchBy) => {
        let newPage = 1;
        const trimValue = value?.trim();
        disableButtonFunc();
        if (!_.isEmpty(trimValue)) {
            let newQuery = { query: trimValue, sortBy: sortBy, page: newPage, searchBy: searchBy};
            console.log(newQuery)
            setquery(newQuery);
            if (active === 'a') {
                setPageNotAssign(newPage);
                dispatch(notAssignPackageQuery(currentDoctor?.id, newQuery));
            } else {
                setPageAssign(newPage);
                dispatch(assignPackageQuery(currentDoctor?.id, newQuery));
            }
        } else {
            getNonQueryService(sortBy);
        }
    })

    const getNonQueryService = (sortBy) => {
        let newPage = 1;
        let newQuery = { sortBy: sortBy, page: newPage, searchBy: searchBy};
        // console.log(newQuery)
        setquery(newQuery);
        if (active === 'a') {
            setPageNotAssign(newPage);

            dispatch(notAssignPackageQuery(currentDoctor?.id, newQuery));
        } else {
            setPageAssign(newPage);
            dispatch(assignPackageQuery(currentDoctor?.id, newQuery));
        }
    }

    const getMoreData = () => {
        disableButtonFunc();
        if (active === 'a') {
            let next = pageNotAssign + 1;
            setPageNotAssign(next);
            const trimValue = textSearch.trim();
            let newQuery = { page: next, searchBy: searchBy, sortBy: sortBy, query: trimValue };
            // console.log(newQuery)
            dispatch(nextNotAssignPackageQuery(currentDoctor?.id, newQuery));
        } else {
            let next = pageAssign + 1;
            setPageAssign(next);
            const trimValue = textSearch.trim();
            let newQuery = { page: next, searchBy: searchBy, sortBy: sortBy, query: trimValue };
            dispatch(nextAssignPackageQuery(currentDoctor?.id, newQuery));
        }
    }

    const disableButtonFunc = () => {
        setdisableButton(true);
        setTimeout(() => {
            setdisableButton(false);
        }, 1000);
    }

    const handleCreated_at = (value) => {
        return moment(value).format('DD-MM-YYYY HH:mm');
    }

    const onChangeButton = e => {
        handleSearchAndSort(textSearch, sortBy, searchBy, e.target.value);
    };

    const formatDateTime = (dateValue, time1, time2) => {
        dateValue = dateValue?.split("-");
        dateValue = dateValue?.[2] + "-" + dateValue?.[1] + "-" + dateValue?.[0];
        time1 = time1?.substring(0, 5);
        time2 = time2?.substring(0, 5);
        return dateValue + " " + time1 + " - " + time2;
    }

    function cancel() {

    }

    const handleCancel = e => {
        setVisible(false)
    };

    const showModal = (id, packageAddress) => {
        setVisible(true);
        setPackageAddress(packageAddress);
        dispatch(getPatientInfo(id));
    };

    const renderSortStatus = sortStatus.status.map((value,index)=>{
        return (
            <Menu.Item key={value.id}>
                {value.msg}
            </Menu.Item>
        )
    })

    const renderSearchStatus = searchStatus.status.map((value,index)=>{
        return (
            <Menu.Item key={value.id}>
                {value.msg}
            </Menu.Item>
        )
    })

    const menu1 = (
        <Menu selectedKeys={sortBy} onClick={handleSortByChange}>
            {renderSortStatus}
        </Menu>
    );

    const menu2 = (
        <Menu selectedKeys={searchBy} onClick={handleSearchByChange}>
            {renderSearchStatus}
        </Menu>
    );


    const packages = (value, type) => {
        return value?.map((value, key) =>
            (
                <div key={key} className="newfit-content-div">
                    <div className="grid-item first-div">
                        <img src={value?.avatarurl} className="img-div" />
                        <div className="info-div">
                            <h1 className="nameText-div"> <a onClick={() => showModal(value?.patient_id, value?.address)}>{value?.patient_name}</a></h1>
                            <div className="phone-div">
                                {value?.phone}
                            </div>
                        </div>
                        <div className="time-div">
                            Thời gian:
                            <span><p>{formatDateTime(value?.date, value?.hour_from, value?.hour_to)}</p></span>
                        </div>
                        <div className="address-div">
                            Địa chỉ khám: <p>{value?.address}</p>
                        </div>
                    </div>
                    <div className="colorTag-div">a</div>
                    <div className=" second-div">
                        <div className="grid-left-div">
                            <div className="reason-div">
                                Lý do/Ghi chú địa chỉ: {value?.reason}
                            </div>

                            {(type === 2) && (<div className="more-div">
                                <Link target="_blank" to={"package/" + value?.package_id} >Chi tiết</Link>
                                <span className="chitiet-div"><ArrowRightOutlined /></span>
                            </div>)}
                        </div>
                        <div className="grid-right-div">

                            <div className="timeSend-div">
                                Gửi lúc: <p>{handleCreated_at(value?.created_at)}</p>
                            </div>

                            {type === 1 && value?.package_id_duplicate===null && (<Popconfirm
                                title="Bạn có chắc chắn không?"
                                onConfirm={e => { onClickOnNotAssign(key); }}
                                onCancel={cancel}
                                okText="Chắc chắn"
                                cancelText="Không"
                            >
                                <button className="link-button-accept-div" id={value?.package_id} onClick={e => e.preventDefault()}><span>Chấp nhận</span></button>
                            </Popconfirm>)}

                            {type === 2 && value?.package_id_duplicate!==null && (<Popover
                                title="Bạn có chắc chắn không?"

                                trigger="click"
                                content={(
                                    <div>
                                        <input required onChange={onChangeRejectText} />
                                        <button className="reject-button-input-div" onClick={e => { e.preventDefault();rejectOnAssignDuplicated(key); }}>Gửi</button>
                                    </div>
                                )}
                            >
                                <button className="link-button-reject-div" id={value?.package_id} onClick={e => e.preventDefault()}><span>Từ chối</span></button>
                            </Popover>)}

                            {(type === 2 && value?.package_id_duplicate===null) && (<div>
                                <Popover
                                    title="Xin hãy cho biết lý do chính đáng?"
                                    trigger="click"
                                    content={(
                                        <div>
                                            <input required onChange={onChangeRejectText} />
                                            <button className="reject-button-input-div" onClick={e => { e.preventDefault();rejectOnAssign(key); }}>Gửi</button>
                                        </div>
                                    )}
                                >
                                    <button className="reject-div" id={value?.package_id} onClick={e => e.preventDefault()}><span>Từ chối</span></button>
                                </Popover>

                                <Popconfirm
                                    title="Bạn có chắc chắn không?"
                                    onConfirm={e => { e.preventDefault();acceptOnAssign(key) }}
                                    onCancel={cancel}
                                    okText="Chắc chắn"
                                    cancelText="Không"
                                >
                                    <button className="accept-div" id={value?.package_id}><span> Chấp nhận</span></button>
                                </Popconfirm></div>)}

                        </div>
                    </div>
                    <hr className="hrNewFeed-div" />
                </div>
            )
        );
    }
    const content = {
        a: (<div className="newfit-container">

            <div className="newfit-content">
                
                <div className="newfit-left-div">
                    {notAssignPackage?.length !== 0 ? packages(notAssignPackage, 1) : 
                        <center>
                            <h3>Hiện tại không có yêu cầu nào</h3>
                        </center>
                        }

                    
                        <center>
                            {packages(notAssignPackage, 1) && !isOutOfDataNotAssign && (<button
                                onClick={getMoreData}
                                disabled={disableButton || isLoad}
                                className={disableButton || isLoad ? "disable-button-service" : "link-button-div"}
                                id="button">
                                Hiển thị thêm {isLoad && <LoadingOutlined />}
                            </button>)}
                        </center>
                        
                </div>
            </div>
        </div>),
        b: (<div className="newfit-container">

            <div className="newfit-content">

                <div className="newfit-left-div">
                    
                    {assignPackage?.length !== 0 ? packages(assignPackage, 2) : 
                        <center>
                            <h3>Hiện tại không có yêu cầu nào</h3>
                        </center>
                        }
                    <center>
                        {!isOutOfDataAssign && (<button
                            onClick={getMoreData}
                            disabled={disableButton || isLoad}
                            className={disableButton || isLoad ? "disable-button-service" : "link-button-div"}
                            id="button">
                            Hiển thị thêm {isLoad && <LoadingOutlined />}
                        </button>)}
                    </center>
                </div>
            </div>
        </div>)
    };


    return (
        <div className="default-div">
            <div>
                <Navbar />
                <Spin size="large" spinning={isLoad}  >
                    <div className="firstTab-div">
                        <div className="test-div">
                            <div className="searchText-div">
                                <Search
                                    placeholder="Tìm kiếm yêu cầu"
                                    onSearch={handleSearchEnter}
                                    onChange={onChange}
                                    id="textSearch"
                                    loading={disableButton || isLoad}
                                    enterButton="Tìm"
                                />
                            </div>

                            <div className="sortBy-div">
                                <Dropdown overlay={menu1}>
                                    <Button onClick={e => e.preventDefault()}>
                                       {sortBy === "created_at" ? "Ngày taọ yêu cầu" : "Ngày thực hiện yêu cầu"} <DownOutlined />
                                    </Button>
                                </Dropdown>
                            </div>
                            <div className="searchBy-div">
                                <Dropdown overlay={menu2}>
                                    <Button onClick={e => e.preventDefault()}>
                                    {searchBy === "name" ? "Tên" : "Địa chỉ"} <DownOutlined />
                                    </Button>
                                </Dropdown>
                            </div>
                        </div>
                        <div className="tab-div">
                            <Tab
                                active={active}
                                onChange={active => { setActive(active); }}
                            >
                                <div key="a">Yêu cầu chung</div>
                                <div key="b">Yêu cầu được chỉ định</div>
                                {/* <div key="d">Yêu cầu sắp hết hạn</div> */}
                            </Tab>
                        </div>
                        {visible ? <Patient handleCancel={handleCancel} visible={visible} patientAddress={packageAddress} doctorAddress={currentDoctor?.address} /> : ""}
                    </div>
                    <div>{content[active]}</div>
                </Spin>
            </div>
        </div>
    );
};

export default DoctorNewFeedTab;
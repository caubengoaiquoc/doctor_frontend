import React, { useEffect, useState, useRef } from 'react';
import "./style.css"
import { PageHeader, Button, Descriptions, Tag, Tabs, Spin, Avatar, Popconfirm, Input } from 'antd';
import { withRouter, Link, Redirect } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getPackageInfo, getPackageStatus, changePackageStatus, doctorAcceptPackage, doctorRejectPackage } from '../../redux/package';
import moment from "moment"
import PackageAppointment from './components/PackageAppointment';
import { UserOutlined } from '@ant-design/icons';
import PackageHistory from './components/PackageHistory';
import _ from "lodash"
import ChartForPackage from '../ChartForPackage';
import EditForm from './components/EditForm';
import {
    getPatientInfo
} from '../../redux/patient';
import {
    getAllAppointmentByPackage
} from '../../redux/package';
import { Timeline } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Modal, Rate } from 'antd';
import packageStatus from "../../configs/packageStatus"
import package_status from "../../configs/package_status";
import Patient from '../../components/Patient';

const { TabPane } = Tabs;

const desc = ['Tệ', 'Không Hài Lòng', 'Cần Cải Thiện', 'Hài Lòng', 'Tuyệt Vời'];

const PackageDetail = (props) => {

    const [modal, setmodal] = useState(false);
    const [note, setnote] = useState('');
    const { packageInfo, packageData } = useSelector(state => state.package);
    const { currentDoctor } = useSelector(state => state.doctor);
    const { patientInfo } = useSelector(state => state.patient);
    const { isLoad } = useSelector(state => state.ui);
    const [visiblePatient, setVisiblePatient] = useState(false);

    const [rateVisible, setRateVisible] = useState(false);
    const [rateValue, setrateValue] = useState(0);
    const [rateDefault, setRateDefault] = useState(0);
    const [rateNote, setRateNote] = useState('');
    const [currentPacakge, setcurrentPacakge] = useState({});

    const dispatch = useDispatch();
    const id = props.match.params.id

    const showModal = (id) => {
        setVisiblePatient(true);
        dispatch(getPatientInfo(id));
        // console.log('id package:',packageInfo);
    };

    useEffect(() => {
        if (packageInfo?.star)
            setRateDefault(packageInfo?.star)
    }, [packageInfo]);

    useEffect(() => {

        window.scroll(0, 0)
        dispatch(getPackageInfo(id))
        dispatch(getPackageStatus(id));

    }, []);

    if (!_.isEmpty(packageInfo) && !_.isEmpty(currentDoctor) && (packageInfo?.doctor_id !== currentDoctor?.id)) {
        return <Redirect to="/package" />
    }

    const toAllPackage = () => {
        props.history.push("/package")
    }

    const cancel = (e) => {

    }

    const onChange = (e) => {
        setnote(e.target.value)
    }

    const confirm = (value) => {
        const data = {};
        data.note = note;
        data.packageId = id;
        data.statusId = value;
        dispatch(changePackageStatus(data))
    }

    const acceptPackage = () => {
        dispatch(doctorAcceptPackage(currentDoctor?.id, id));

    }

    const rejectPackage = () => {
        dispatch(doctorRejectPackage(currentDoctor?.id, id, note));
    }


    const renderStatusChange = () => {
        if (
            (
                packageData?.status[packageData?.status.length - 1]?.package_status_detail_id === package_status.running
            )) {
            return [
                <Popconfirm
                    title={<Input onChange={onChange} placeholder="Ghi chú hoàn thành" />}
                    onConfirm={(e) => confirm(package_status.done)}
                    placement="bottom"
                    onCancel={cancel}
                    okText="Xác nhận"
                    cancelText="Hủy"
                >
                    <Button type="primary" key="1">Hoàn thành</Button>
                </Popconfirm>
                ,
                <Popconfirm
                    title={<Input onChange={onChange} placeholder="Ghi chú hủy" />}
                    onConfirm={(e) => confirm(package_status.doctorCancel)}
                    placement="bottom"
                    onCancel={cancel}
                    okText="Xác nhận"
                    cancelText="Hủy"
                >
                    <Button type="danger" key="2">Hủy</Button>
                </Popconfirm>
            ]
        } else if (
            (
                packageData?.status[packageData?.status.length - 1]?.package_status_detail_id === package_status.waiting
            )
        ) {
            return [<Popconfirm
                title={"Chấp nhận"}
                onConfirm={(e) => acceptPackage()}
                placement="bottom"
                onCancel={cancel}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <Button type="primary" key="1">Chấp nhận</Button>
            </Popconfirm>
                ,
            <Popconfirm
                title={<Input onChange={onChange} placeholder="Ghi chú từ chối" />}
                onConfirm={(e) => rejectPackage()}
                placement="bottom"
                onCancel={cancel}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <Button type="danger" key="2">Từ chối</Button>
            </Popconfirm>
            ]
        }
    }

    const handleCancelvisiblePatient = e => {
        setVisiblePatient(false)
    };

    const openRateModal = (value) => {
        setRateVisible(true)
        setRateNote(value?.comment ?? 'Không có ghi chép')
        setcurrentPacakge(value)
    }

    const handleRateModalCancel = () => {
        setRateVisible(false)
    };



    return (
        <div className="default-div">
            <div className="site-page-header-ghost-wrapper">
                <Spin size="large" spinning={isLoad}>
                    <Modal
                        visible={rateVisible}
                        title={"Đánh giá chất lượng gói dịch vụ BS." + currentPacakge?.doctor_name}
                        onCancel={handleRateModalCancel}
                        footer={[
                            <Button key="back" onClick={handleRateModalCancel}>Đóng</Button>
                        ]}
                    >
                        <span>
                            <Rate tooltips={desc} disabled autoAdjustOverflow={true} value={rateDefault} />
                            {rateDefault ? <span className="ant-rate-text">{desc[rateDefault - 1]}</span> : ''}
                            <br /><br />
                            <h3>Ghi chú</h3>
                            <div>{rateNote}</div>
                        </span>
                    </Modal>

                    <PageHeader
                        ghost={false}
                        tags={<Tag color="blue">{!_.isEmpty(packageData?.status) ? packageData?.status[packageData.status.length - 1]?.status_name : ''}</Tag>}
                        onBack={toAllPackage}
                        title="Thông tin gói"
                        subTitle={id}
                        extra={renderStatusChange()
                        }
                        footer={
                            <Tabs defaultActiveKey="1">
                                <TabPane tab="Lịch hẹn" key="1" href="#package-appointment">
                                    <PackageAppointment id={id} />
                                </TabPane>
                                <TabPane tab="Lịch sử" key="2" >
                                    <PackageHistory id={id} />
                                </TabPane>
                                <TabPane tab="Ghi chú" key="3" >
                                    <EditForm editfor='plan_overview' content={packageInfo?.plan_overview} />
                                </TabPane>
                                <TabPane tab="Kết quả" key="4" >
                                    <EditForm editfor='result_content' content={packageInfo?.result_content} />
                                </TabPane>
                                <TabPane tab="Biểu đồ sức khoẻ" key="5">
                                    <ChartForPackage id={id} />
                                </TabPane>
                            </Tabs>
                        }
                    >
                        <Descriptions size="small" column={3}>
                            <Descriptions.Item label="Bệnh nhân">
                                <a onClick={() => showModal(packageInfo?.patient_id)}>
                                    <Avatar shape="square" size={50} icon={<UserOutlined />}
                                        src={packageInfo.avatarurl} style={{ marginRight: '10px' }}/>
                                    {packageInfo.patient_name}</a>
                                {packageInfo?.address ? <Patient handleCancel={handleCancelvisiblePatient} visible={visiblePatient} patientAddress={packageInfo?.address} doctorAddress={currentDoctor?.address} /> : ""}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {packageInfo?.phone}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ khám ban đầu">{packageInfo?.address}</Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {moment(packageInfo?.created_at).format('DD/MM/YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Lý do/Ghi chú địa chỉ">
                                {packageInfo?.reason}
                            </Descriptions.Item>
                            {packageData?.status[packageData?.status.length - 1]?.package_status_detail_id === package_status.done
                                || packageData?.status[packageData?.status.length - 1]?.package_status_detail_id === package_status.customerCancel
                                || packageData?.status[packageData?.status.length - 1]?.package_status_detail_id === package_status.systemCancel
                                || packageData?.status[packageData?.status.length - 1]?.package_status_detail_id === package_status.doctorCancel
                                ? <Descriptions.Item label="Đánh giá">
                                    {packageInfo?.package_rating_id
                                        ? <>
                                            <Rate tooltips={desc} disabled autoAdjustOverflow={true} value={rateDefault} />
                                            <Button onClick={() => openRateModal(packageInfo)} style={{ marginLeft: '10px' }} size="small">Xem đánh giá</Button>
                                        </>
                                        : <>Chưa có đánh giá </>
                                    }
                                </Descriptions.Item>
                                : ''
                            }
                        </Descriptions>
                    </PageHeader>
                </Spin>
            </div>
            <div></div>
        </div>
    );
};

export default withRouter(PackageDetail);
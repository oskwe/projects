import { ProxyHeadersDialog } from '../../../components/dialogs/proxy-headers-dialog/ProxyHeadersDialog';
import React, { useEffect, useState } from "react";
import IndividualsService from "../../../api/services/individuals-service";
import OrganizationsService from "../../../api/services/organizations-service";
import ProxyHeaderService from "../../../api/services/proxy-header-service"
import dayjs from 'dayjs';
import { Space, Table, Button } from "antd";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from "react-router-dom";

export const ProxyListView = ({
    ...props
}) => {
    const columns = [
        {
            title: 'Код',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Номер',
            dataIndex: 'number',
            key: 'number',
        },
        {
            title: 'Дата выписки',
            dataIndex: 'dischargeDate',
            render:(text)=>dayjs(text).format('DD.MM.YYYY')
        },
        {
            title: 'Дата окончания',
            dataIndex: 'endDate',
            render:(text)=>dayjs(text).format('DD.MM.YYYY')
        },
        {
            title: 'Физ. лицо',
            dataIndex: 'individualId',
            render: (text, record) => individuals.find(it => it.id === record.individualsId)?.lastName,
        },
        {
            title: 'Организация',
            dataIndex: 'organizationId',
            render: (text, record) => organizations.find(it => it.id === record.organizationsId)?.title,
        },

        {
            title: 'Действия',
            key: 'actions',
            render: (text, record) => {
                return (
                    <Space size="middle">
                        <div onClick={() => updateRecordHandler(record)}>
                            <EditOutlined />
                        </div>
                        <div onClick={() => deleteRecordHandler(record.id)}>
                            <DeleteOutlined />
                        </div>
                    </Space>
                )
            }
        }
    ];

    const navigate = useNavigate();
    const [list, setList] = useState([]);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [visible, setVisible] = useState(false);

    const [individuals, setIndividuals] = useState([]);
    const [organizations, setOrganizations] = useState([]);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const individuals = await IndividualsService.getAllRecords();
          const organizations = await OrganizationsService.getAllRecords();
          const list = await ProxyHeaderService.getAllRecords();   //CAS   
          setIndividuals(individuals);
          setOrganizations(organizations);
          setList(list);
        } catch (res) {
          alert("Произошла ошибка:", res);
        }
      };
    
      fetchData();
    }, []);
    console.log(list);

    const createRecordHandler = () => {
        setCurrentRecord(null)
        setVisible(true);
    }

    const updateRecordHandler = (record) => {
        setCurrentRecord(record)
        setVisible(true)
    }

    const deleteRecordHandler = async (recordId) => {
        await ProxyHeaderService.removeRecord(recordId);
        setList(list.filter(it => it.id !== recordId));
    }

    return (
        <div style={{ padding: 16 }}>
            <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 16, fontSize: 48 }}>
                Журнал доверенностей
            </div>
            <Table
                dataSource={list}
                columns={columns}
                onRow={(record, rowIndex) => ({
                    onDoubleClick: event => {
                        navigate(`/proxy/${record.id}`);
                    },
                })}
            />
            <Button onClick={createRecordHandler}>
                Создать
            </Button>
            <ProxyHeadersDialog
                visible={visible}
                onOk={(record) => {
                    currentRecord
                        ? setList(list.map(it => it.id === currentRecord.id
                            ? { ...record }
                            : it))
                        : setList([...list, record]);

                    setCurrentRecord(null);
                    setVisible(false);
                }}
                onCancel={() => setVisible(false)}
                currentRecord={currentRecord}
                individuals={individuals}
                organizations={organizations}
            />
        </div>
    )
}

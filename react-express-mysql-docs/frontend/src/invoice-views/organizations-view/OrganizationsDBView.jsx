import { Space, Table, Button } from "antd";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from "react";
import { OrganizationsDBDialog } from "../../components/invoice-dialogs/organizations-dialog/OrganizationsDBDialog";
import OrganizationsService from "../../api/invoice-services/organizations-service";

export const OrganizationsDBView = ({
        ...props
}) => {

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: "Название компании",
            dataIndex: "name",
        },
        {
            title: 'Структурное подразделение',
            dataIndex: 'structDivision',
        },
        {
            title: 'Вид деятельности',
            dataIndex: 'activity',
        },
        
        {
            title: 'Действия',
            key: 'actions',
            render: (text, record) => {
                return (
                    <Space size="middle">
                        <div onClick={() => updateRecordHandler(record)}>
                            <EditOutlined/>
                        </div>
                        
                        <div onClick={() => deleteRecordHandler(record.id)}>
                            <DeleteOutlined/>
                        </div>
                    </Space>
                );
            }
        }
    ];

    const [list, setList] = useState([]);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [visible, setVisible] = useState(false); 

    useEffect(() => {
        async function fetchData() {
            const list = await OrganizationsService.getAllRecords();
            setList(list);
            return () => setList([]);
        }
        fetchData();
    }, []);

    const createRecordHandler = () => {
        setCurrentRecord(null);
        setVisible(true);
    };

    const updateRecordHandler = (record) => {
        setCurrentRecord(record);
        setVisible(true);
    };

    const deleteRecordHandler = async (recordId) => {
        await OrganizationsService.removeRecord(recordId);
        setList(list.filter(it => it.id !== recordId));
    };

    return (
       <div style={{ padding: 16 }}>
            <Table dataSource={list} columns={columns} />
            <Button onClick={createRecordHandler}>
                Создать
            </Button>
            <OrganizationsDBDialog 
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
            />
        </div>
    );
};

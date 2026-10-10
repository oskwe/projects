import { Space, Table, Button } from "antd";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from "react";
import { CorrespondentDialog } from "../../components/invoice-dialogs/correspondent-dialog/CorrespondentDialog";
import CorrespondentService from "../../api/invoice-services/correspondent-service";

export const CorrespondentView = ({
        ...props
}) => {

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Счет',
            dataIndex: 'account',
        },
        {
            title: 'Код',
            dataIndex: 'code',
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
            const list = await CorrespondentService.getAllRecords();
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
        await CorrespondentService.removeRecord(recordId);
        setList(list.filter(it => it.id !== recordId));
    };

    return (
       <div style={{ padding: 16 }}>
            <Table dataSource={list} columns={columns} />
            <Button onClick={createRecordHandler}>
                Создать
            </Button>
            <CorrespondentDialog 
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
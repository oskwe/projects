import { Space, Table, Button } from "antd";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from "react";
import { OrganizationsDialog } from "../../components/dialogs/organizations-dialog/OrganizationsDialog"
import OrganizationsService from "../../../src/api/services/organizations-service"

export const OrganizationsView = ({
        ...props
}) => {

    const columns = [
        {
            title: 'Код',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Наименование',
            dataIndex: 'title',
        },
        {
            title: 'ИНН',
            dataIndex: 'inn',
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
                )
            }
        }
    ];

    const [list, setList] = useState([]);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [visible, setVisible] = useState(false); 

    useEffect( () => {
        async function fetchData() {
            const list = await OrganizationsService.getAllRecords();
            setList(list);
            return () => setList([]);
        }
        fetchData();
    }, [])

    const createRecordHandler = () => {
        setCurrentRecord(null)
        setVisible(true);
    }

    const updateRecordHandler = (record) => {
        setCurrentRecord(record)
        setVisible(true)
    }

    const deleteRecordHandler = async(recordId) => {
        await OrganizationsService.removeRecord(recordId);
        setList(list.filter(it => it.id !== recordId));
    }

    return (
       <div style={{padding: 16}}>
            <Table dataSource={list} columns={columns}/>
            <Button onClick={createRecordHandler}>
            Создать
            </Button>
            <OrganizationsDialog 
                visible={visible}
                onOk={(record) => {
                    currentRecord
                        ? setList(list.map(it => it.id === currentRecord.id
                            ? {...record }
                            : it))
                        : setList([...list, record]);
                            
                        setCurrentRecord(null);
                        setVisible(false);

                }}
                onCancel={() => setVisible(false)}
                currentRecord={currentRecord}
            />
    
        </div>
    )
}

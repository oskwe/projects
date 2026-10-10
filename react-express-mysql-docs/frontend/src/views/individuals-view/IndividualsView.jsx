import { Space, Table, Button } from "antd";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from "react";
import { IndividualsDialog } from "../../components/dialogs/individuals-dialog/IndividualsDialog";
import IndividualsService from "../../api/services/individuals-service";

export const IndividualsView = ({
        ...props
}) => {

    const columns = [
        {
            title: 'Код',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Фамилия',
            dataIndex: 'lastName',
        },
        {
            title: 'Имя',
            dataIndex: 'firstName',
        },
        {
            title: 'Отчество',
            dataIndex: 'patronymic',
        },
        {
            title: 'Кем выдан паспорт',
            dataIndex: 'issued',
        },
        {
            title: 'Серия',
            dataIndex: 'series',
        },
        {
            title: 'Номер',
            dataIndex: 'number',
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
            const list = await IndividualsService.getAllRecords();
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
        await IndividualsService.removeRecord(recordId);
        setList(list.filter(it => it.id !== recordId));
    }

    return (
       <div style={{padding: 16}}>
            <Table dataSource={list} columns={columns}/>
            <Button onClick={createRecordHandler}>
            Создать
            </Button>
            <IndividualsDialog 
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

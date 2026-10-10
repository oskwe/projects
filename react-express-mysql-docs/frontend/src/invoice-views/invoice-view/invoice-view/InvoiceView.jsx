import React, { useEffect, useState } from 'react';
import { DatePicker, Button, Space, Table, Select } from "antd";
import { useParams } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import InvoiceHeaderService from '../../../api/invoice-services/invoice-header-service';
import InvoiceBodyService from '../../../api/invoice-services/invoice-body-service';
import CorrespondentService from '../../../api/invoice-services/correspondent-service';
import AssetsService from '../../../api/invoice-services/assets-service';
import { InvoiceBodiesDialog } from '../../../components/invoice-dialogs/invoice-body-dialog/InvoiceBodiesDialog';
import dayjs from 'dayjs';

export const InvoiceView = () => {
    const { id } = useParams();
    const [invoiceHeaders, setInvoiceHeaders] = useState([]);
    const [invoiceBodies, setInvoiceBodies] = useState([]);
    const [correspondents, setCorrespondents] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);

    // Fetch data on mount
    const fetchData = async () => {
        setLoading(true);
        try {
            console.log("Fetching data for invoice header ID:", id); // Log the ID
            const [headerData, bodyData, correspondentData, assetsData] = await Promise.all([
                InvoiceHeaderService.getAllRecords(),
                InvoiceBodyService.getAllHeadersRecords(id),
                CorrespondentService.getAllRecords(),
                AssetsService.getAllRecords()
            ]);

            setInvoiceHeaders(headerData);
            setInvoiceBodies(bodyData);
            setCorrespondents(correspondentData);
            setAssets(assetsData);
            
        } catch (error) {
            console.error("Error loading data:", error); // Log the error
            // message.error("Ошибка при загрузке данных: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    // Columns for the table
    const columns = [
        {
                    title: 'Код',
                    dataIndex: 'id',
                    key: 'id',
                },
                {
                    title: 'Наименование',
                    dataIndex: 'ordinal',
                },
                
        {
                    title: 'Единица измерения',
                    dataIndex: 'name',
                },
        {
            title: 'Количество',
            dataIndex: 'price',
        },
        {
            title: 'Действия',
            render: (text, record) => (
                <Space size="middle">
                    <div onClick={() => updateRecordHandler(record)}>
                        <EditOutlined />
                    </div>
                    <div onClick={() => deleteRecordHandler(record.id)}>
                        <DeleteOutlined />
                    </div>
                </Space>
            ),
        },
    ];

    // Add new record
    const createRecordHandler = () => {
        setCurrentRecord(null);  // Clear any existing record for new one
        setVisible(true);         // Open the dialog
    };

    // Update record handler
    const updateRecordHandler = (record) => {
        setCurrentRecord(record); // Set the current record for editing
        setVisible(true);         // Open the dialog
    };

    // Delete record handler
    const deleteRecordHandler = async (recordId) => {
        try {
            await InvoiceBodyService.removeRecord(recordId);
            setInvoiceBodies(invoiceBodies.filter(it => it.id !== recordId));
        } catch (error) {
            // message.error("Ошибка при удалении записи: " + error.message);
        }
    };

    // Handle modal dialog ok
    const handleDialogOk = (record) => {
        if (currentRecord) {
            setInvoiceBodies(invoiceBodies.map(it => it.id === currentRecord.id ? record : it));
        } else {
            setInvoiceBodies([...invoiceBodies, record]);
        }
        fetchData(); // Fetch updated data after adding/editing
        setCurrentRecord(null);
        setVisible(false);
    };

    // Handle modal dialog cancel
    const handleDialogCancel = () => {
        setVisible(false);
    };

    const handlePrint = () => {
        window.print();
    };
    

    return (
        <div>
            <div direction={'vertical'} align={'center'} style={{ width: '100%', marginBottom: 24, fontSize: '48px', fontWeight: 'bold' }}>
                Накладная на перемещение материальных ценностей № <strong>{id}</strong>
            </div>

                    

                    

            {/* Main Invoice Body Table */}
            <Table
                columns={columns}
                dataSource={invoiceBodies}
                rowKey="id"
                bordered
                loading={loading}
                pagination={false}
            />

            <Space style={{ marginTop: 16 }}>
                <Button type="primary" onClick={createRecordHandler}>Создать</Button>
                <Button type="dashed" onClick={handlePrint}>Печать</Button>
            </Space>

            <InvoiceBodiesDialog
                visible={visible}
                onOk={handleDialogOk}
                onCancel={handleDialogCancel}
                currentRecord={currentRecord}
                invoiceHeaderId={id}
                correspondentService={CorrespondentService}
                assetsService={AssetsService}
            />
        </div>
    );
};

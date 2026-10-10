import React, { useEffect, useState } from 'react';
import { Table, message, Button, Space, Select, Input } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import InvoiceHeaderService from '../../../api/invoice-services/invoice-header-service';
import InvoiceBodyService from '../../../api/invoice-services/invoice-body-service';
import CorrespondentService from '../../../api/invoice-services/correspondent-service';
import AssetsService from '../../../api/invoice-services/assets-service';
import { InvoiceBodiesDialog } from '../../../components/invoice-dialogs/invoice-body-dialog/InvoiceBodiesDialog';
import dayjs from 'dayjs';

const { Option } = Select;

export const InvoiceCreateView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoiceHeaders, setInvoiceHeaders] = useState([]);
    const [invoiceBodies, setInvoiceBodies] = useState([]);
    const [correspondents, setCorrespondents] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [invoiceHeader, setInvoiceHeader] = useState({
        invoiceNumber: '',
        invoiceDate: dayjs(),
        correspondentId: null,
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
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
                message.error("Ошибка при загрузке данных: " + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const columns = [
        {
            title: 'Корреспондирующий счет',
            children: [
                {
                    title: 'Код',
                    dataIndex: 'id',
                    key: 'id',
                },
                {
                    title: 'Счет, субсчет',
                    dataIndex: 'account',
                    render: (text, record) => {
                        const correspondent = correspondents.find(it => it.id === record.correspondentId);
                        return correspondent?.account || '—';
                    },
                },
                {
                    title: 'Код аналитического учета',
                    dataIndex: 'code',
                    render: (text, record) => {
                        const correspondent = correspondents.find(it => it.id === record.correspondentId);
                        return correspondent?.code || '—';
                    },
                },
            ],
        },
        {
            title: 'Материальные ценности',
            children: [
                {
                    title: 'Наименование',
                    dataIndex: 'name',
                    render: (text, record) => {
                        const asset = assets.find(it => it.id === record.assetsId);
                        return asset?.name || '—';
                    },
                },
                {
                    title: 'Номенклатурный номер',
                    dataIndex: 'nomenclature',
                    render: (text, record) => {
                        const asset = assets.find(it => it.id === record.assetsId);
                        return asset?.nomenclature || '—';
                    },
                },
            ],
        },
        {
            title: 'Единица измерения',
            children: [
                {
                    title: 'Код',
                    dataIndex: 'measCode',
                },
                {
                    title: 'Наименование',
                    dataIndex: 'measName',
                },
            ],
        },
        {
            title: 'Количество',
            children: [
                {
                    title: 'Затребовано',
                    dataIndex: 'firstQuantity',
                    render: (text, record) => {
                        const asset = assets.find(it => it.id === record.assetsId);
                        return asset?.firstQuantity || '—';
                    },
                },
                {
                    title: 'Отпущено',
                    dataIndex: 'secondQuantity',
                    render: (text, record) => {
                        const asset = assets.find(it => it.id === record.assetsId);
                        return asset?.secondQuantity || '—';
                    },
                },
            ],
        },
        {
            title: 'Цена, руб. коп.',
            dataIndex: 'price',
            render: (text, record) => {
                const asset = assets.find(it => it.id === record.assetsId);
                return asset?.price || '—';
            },
        },
        {
            title: 'Сумма без учета НДС, руб. коп.',
            dataIndex: 'sum',
            render: (text, record) => {
                const asset = assets.find(it => it.id === record.assetsId);
                return asset?.sum || '—';
            },
        },
        {
            title: 'Порядковый номер по складской картотеке',
            dataIndex: 'ordinal',
            render: (text, record) => {
                const asset = assets.find(it => it.id === record.assetsId);
                return asset?.ordinal || '—';
            },
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

    const createRecordHandler = () => {
        setCurrentRecord(null);
        setVisible(true);
    };

    const updateRecordHandler = (record) => {
        setCurrentRecord(record);
        setVisible(true);
    };

    const deleteRecordHandler = async (recordId) => {
        try {
            await InvoiceBodyService.removeRecord(recordId);
            setInvoiceBodies(invoiceBodies.filter(it => it.id !== recordId));
        } catch (error) {
            message.error("Ошибка при удалении записи: " + error.message);
        }
    };

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

    const handleDialogCancel = () => {
        setVisible(false);
    };

    return (
        <div>
            <Space direction="vertical" style={{ width: '100%' }}>
                <h2>
                    <label>Номер счета
                        <Input
                            value={invoiceHeader.invoiceNumber}
                            onChange={e => setInvoiceHeader({ ...invoiceHeader, invoiceNumber: e.target.value })}
                            style={{ width: 100 }}
                            placeholder="№"
                        />
                    </label>
                </h2>

                <Space>Дата счета
                    <Input
                        value={invoiceHeader.invoiceDate.format("DD.MM.YYYY")}
                        onChange={e => setInvoiceHeader({ ...invoiceHeader, invoiceDate: dayjs(e.target.value) })}
                        style={{ width: 150 }}
                        placeholder="Дата"
                    />
                </Space>

                <Space>Корреспондент:
                    <Select
                        value={invoiceHeader.correspondentId || null}
                        onChange={value => setInvoiceHeader({ ...invoiceHeader, correspondentId: value })}
                        style={{ width: 250 }}
                    >
                        {correspondents.map(it => (
                            <Option key={it.id} value={it.id}>
                                {it.account}
                            </Option>
                        ))}
                    </Select>
                </Space>
            </Space>

            <Table
                columns={columns}
                dataSource={invoiceBodies}
                rowKey="id"
                bordered
                loading={loading}
                pagination={false}
            />

            <Space style={{ marginTop: 16 }}>
                <Button type="primary" onClick={createRecordHandler}>
                    Добавить запись
                </Button>
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

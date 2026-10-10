import { DatePicker, Button, Space, Table, Select, Input } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from "react-router-dom";
import ProxyBodyService from "../../../api/services/proxy-body-service";
import ProxyHeaderService from "../../../api/services/proxy-header-service";
import OrganizationsService from "../../../api/services/organizations-service";
import IndividualsService from "../../../api/services/individuals-service";
import ProductService from "../../../api/services/product-service";
import { ProxyBodiesCreateDialog } from "../../../components/dialogs/proxy-body-dialog/ProxyBodiesCreateDialog";
import dayjs from 'dayjs';

const { Option } = Select;

export const ProxyCreateView = (props) => {
    const columns = [
        {
            title: 'Код',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Наименование',
            key: 'title',
            render: (text, record) => product.find(it => it.id === record.productId)?.title,
        },
        {
            title: 'ед. изм.',
            dataIndex: 'unit',
        },
        {
            title: 'Количество',
            dataIndex: 'count',
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (text, record) => (
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
    ];

    const componentRef = useRef();
    const navigate = useNavigate();
    const { id } = useParams();
    const [proxyHeader, setProxyHeader] = useState({
        dischargeDate: dayjs(new Date()),
        endDate: dayjs(new Date())
    });
    const [list, setList] = useState([]);
    const [individuals, setIndividuals] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [product, setProducts] = useState([]);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const list = await ProxyBodyService.getAllHeadersRecords(id);
            const individuals = await IndividualsService.getAllRecords();
            const organizations = await OrganizationsService.getAllRecords();
            const product = await ProductService.getAllRecords();

            setList(list);
            setIndividuals(individuals);
            setOrganizations(organizations);
            setProducts(product);
        };

        fetchData();

        // Очистка состояния при размонтировании
        return () => {
            setList([]);
            setIndividuals([]);
            setOrganizations([]);
            setProducts([]);
        };
    }, [id]);

    const createRecordHandler = () => {
        setCurrentRecord(null);
        setVisible(true);
    };

    const updateRecordHandler = (record) => {
        setCurrentRecord(record);
        setVisible(true);
    };

    const deleteRecordHandler = async (recordId) => {
        await ProxyBodyService.removeRecord(recordId);
        setList(list.filter(it => it.id !== recordId));
    };

    const saveHeader = async () => {
        await ProxyHeaderService.createRecord(proxyHeader);
    };

    const saveBody = async (id) => {
        await Promise.all(list.map(async (record) => {
            record['proxyHeaderId'] = id;
            delete record.id;
            await ProxyBodyService.createRecord(record);
        }));
    };

    const saveRecordHandler = async () => {
        await saveHeader();
        const allRecords = await ProxyHeaderService.getAllRecords();
        const lastId = allRecords[allRecords.length - 1]?.id;
        await saveBody(lastId);
        navigate('/');
    };

    return (
        <div style={{ padding: 16 }}>
            <div ref={componentRef}>
                <Space
                    direction={'vertical'}
                    align={'center'}
                    style={{ width: '100%', marginBottom: 24 }}
                >
                    <h2>
                        <label>Доверенность №
                            <Input
                                onChange={e => setProxyHeader({ ...proxyHeader, number: +e.target.value })}
                                placeholder="№"
                                style={{ width: "65px", fontWeight: "bold", fontSize: "14pt", marginLeft: 10 }}
                            />
                        </label>
                    </h2>

                    <Space>Дата выписки
                        <DatePicker
                            format="DD.MM.YYYY"
                            value={proxyHeader?.dischargeDate}
                            onChange={date => setProxyHeader({ ...proxyHeader, dischargeDate: date })}
                            style={{ width: 232 }}
                            allowClear={false}
                        />
                    </Space>

                    <Space>Дата действия
                        <DatePicker
                            format="DD.MM.YYYY"
                            value={proxyHeader?.endDate}
                            onChange={date => setProxyHeader({ ...proxyHeader, endDate: date })}
                            style={{ width: 232 }}
                            allowClear={false}
                        />
                    </Space>

                    <Space>Доверенность выдана: <strong>
                        <Select
                            value={proxyHeader?.organizationId || null}
                            onChange={value => setProxyHeader({ ...proxyHeader, organizationId: value })}
                            placeholder={"Выберите организацию"}
                            style={{ width: 425 }}
                        >
                            {organizations.map(it => (
                                <Option key={it.id} value={it.id}>
                                    {it.title}
                                </Option>
                            ))}
                        </Select>
                    </strong></Space>

                    <Space>Получатель: <strong>
                        <Select
                            value={proxyHeader?.individualId || null}
                            onChange={value => setProxyHeader({ ...proxyHeader, individualId: value })}
                            placeholder={"Выберите получателя"}
                            style={{ width: 425 }}
                        >
                            {individuals.map(it => (
                                <Option key={it.id} value={it.id}>
                                    {it.lastName} {it.firstName} {it.patronymic}
                                </Option>
                            ))}
                        </Select>
                    </strong></Space>
                </Space>

                <Table dataSource={list} columns={columns} />
            </div>

            <Space
                style={{ width: '100%', display: "flex", justifyContent: "space-between" }}
            >
                <Button onClick={createRecordHandler}>
                    Добавить
                </Button>

                <Space style={{ display: 'flex', gap: 10 }}>
                    <Button onClick={() => navigate('/')}>
                        Отменить
                    </Button>

                    <Button onClick={saveRecordHandler}>
                        Сохранить
                    </Button>
                </Space>
            </Space>

            <ProxyBodiesCreateDialog
                visible={visible}
                onOk={(record) => {
                    currentRecord
                        ? setList(list.map(it => it.id === currentRecord.id ? { ...record } : it))
                        : setList([...list, record]);

                    setCurrentRecord(null);
                    setVisible(false);
                }}
                onCancel={() => setVisible(false)}
                currentRecord={currentRecord}
                product={product}
                proxyHeaderId={id}
            />
        </div>
    );
};

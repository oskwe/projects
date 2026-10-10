import { DatePicker, Button, Space, Table, Select } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useParams } from "react-router";
import ProxyBodyService from "../../../api/services/proxy-body-service";
import ProxyHeaderService from "../../../api/services/proxy-header-service";
import OrganizationsService from "../../../api/services/organizations-service";
import IndividualsService from "../../../api/services/individuals-service";
import ProductService from "../../../api/services/product-service";
import { ProxyBodiesDialog } from "../../../components/dialogs/proxy-body-dialog/ProxyBodiesDialog";
import dayjs from 'dayjs';

const { Option } = Select;

export const ProxyView = ({ onOk, onClick, ...props }) => {
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
    const handlePrint = () => {
        window.print();
    };

    const { id } = useParams();
    const [proxy, setProxy] = useState(null);
    const [list, setList] = useState([]);
    const [individuals, setIndividuals] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [product, setProducts] = useState([]);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const listData = await ProxyBodyService.getAllHeadersRecords(id);
                setList(listData);
            } catch (error) {
                console.error("Ошибка при получении данных:", error);
                // Возможно, покажите уведомление пользователю
            }

            const proxyData = await ProxyHeaderService.getOneRecords(id);
            // const listData = await ProxyBodyService.getAllHeadersRecords(id);
            const individualsData = await IndividualsService.getAllRecords();
            const organizationsData = await OrganizationsService.getAllRecords();
            const productData = await ProductService.getAllRecords();
            
            

            // setList(listData);
            setProxy(proxyData);
            setIndividuals(individualsData);
            setOrganizations(organizationsData);
            setProducts(productData);
        }
        fetchData();

        // Очистка состояния при размонтировании компонента
        return () => {
            setList([]);
            setProxy(null);
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

    const handleDateChange = async (dateField, date) => {
        const updatedProxy = { ...proxy, [dateField]: date };
        setProxy(updatedProxy);
        await ProxyHeaderService.updateRecord(updatedProxy);
    };

    return (
        <div style={{ padding: 16 }}>
            <div ref={componentRef}>
                <Space direction={'vertical'} align={'center'} style={{ width: '100%', marginBottom: 24 }}>
                    <h2>Доверенность № <strong>{proxy?.number}</strong></h2>

                    <Space>
                        Дата выписки
                        <DatePicker
                            format="DD.MM.YYYY"
                            value={dayjs(proxy?.dischargeDate, 'YYYY-MM-DD') || null}
                            onChange={date => handleDateChange('dischargeDate', date)}
                            style={{ width: 232 }}
                            allowClear={false}
                        />
                    </Space>

                    <Space>Дата действия
                        <DatePicker
                            format="DD.MM.YYYY"
                            value={dayjs(proxy?.endDate, 'YYYY-MM-DD') || null}
                            onChange={date => handleDateChange('endDate', date)}
                            style={{ width: 232 }}
                            allowClear={false}
                        />
                    </Space>

                    <Space>Доверенность выдана: <strong>
                        <Select
                            value={proxy?.organizationsId || null}
                            onChange={value => handleDateChange('organizationsId', value)}
                            placeholder={"Выберите организацию"}
                            style={{ width: 425 }}
                        >
                            {organizations.map(it => (
                                <Option key={it.id} value={it.id}> {/* Добавлен key */}
                                    {it.title}
                                </Option>
                            ))}
                        </Select>
                    </strong></Space>

                    <Space>Получатель: <strong>
                        <Select
                            value={proxy?.individualsId || null}
                            onChange={value => handleDateChange('individualsId', value)}
                            placeholder={"Выберите получателя"}
                            style={{ width: 425 }}
                        >
                            {individuals.map(it => (
                                <Option key={it.id} value={it.id}> {/* Добавлен key */}
                                    {it.lastName} {it.firstName} {it.patronymic}
                                </Option>
                            ))}
                        </Select>
                    </strong></Space>
                </Space>

                <Table dataSource={list} columns={columns} />
            </div>

            <Space>
                <Button onClick={createRecordHandler}>Создать</Button>
                <Button type="dashed" onClick={handlePrint}>Печать</Button>
            </Space>

            <ProxyBodiesDialog
                visible={visible}
                onOk={(record) => {
                    currentRecord
                        ? setList(list?.map(it => it.id === currentRecord.id ? { ...record } : it))
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

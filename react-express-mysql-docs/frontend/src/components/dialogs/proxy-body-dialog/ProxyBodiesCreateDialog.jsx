import { Input, Space } from "antd";
import Modal from "antd/lib/modal/Modal";
import React, { useEffect, useState } from "react";
import { Select } from 'antd';

const { Option } = Select;
let localId = 0;

export const ProxyBodiesCreateDialog = ({
    visible,
    onOk,
    onCancel,
    currentRecord,
    product,
    proxyHeaderId,
    ...props
}) => {
    const [proxyBody, setProxyBody] = useState({}); // Инициализируем пустым объектом

    useEffect(() => {
        if (currentRecord) {
            setProxyBody(currentRecord);
        } else {
            setProxyBody({}); // Инициализация пустым объектом
        }
    }, [currentRecord]);

    const onOkHandler = async () => {
        const record = {
            id: localId,
            productId: proxyBody.productId,
            count: proxyBody.count,
            unit: proxyBody.unit,
        };

        onOk(record);
        setProxyBody({}); // Сбрасываем после сохранения
        localId += 1;
    };

    return (
        <Modal
            visible={visible}
            title={currentRecord ? 'Редактировать' : 'Создать'}
            onOk={onOkHandler}
            onCancel={onCancel}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <Select
                    value={proxyBody?.productId || null}
                    onChange={value => setProxyBody({ ...proxyBody, productId: value })}
                    placeholder={"Выберите продукт"}
                    style={{ width: '100%' }}
                >
                    {product?.map(it => (
                        <Option key={it.id} value={it.id}> {/* Добавлен ключ */}
                            {it.title}
                        </Option>
                    ))}
                </Select>

                <Space>
                    <Input 
                        value={proxyBody?.unit || ''}
                        onChange={e => setProxyBody({ ...proxyBody, unit: e.target.value })}
                        placeholder="Укажите ед. измерения"
                    />

                    <Input
                        value={proxyBody?.count || ''}
                        onChange={e => setProxyBody({ ...proxyBody, count: +e.target.value })}
                        placeholder="Укажите количество"
                    />
                </Space>
            </Space>
        </Modal>
    );
};

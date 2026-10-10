import { Input, Space } from "antd";
import Modal from "antd/lib/modal/Modal";
import React, { useEffect, useState } from "react";
import { Select } from 'antd';
import ProxyBodyService from "../../../api/services/proxy-body-service";

const { Option } = Select;

export const ProxyBodiesDialog = ({
    visible,
    onOk,
    onCancel,
    currentRecord,
    product,
    proxyHeaderId,
    ...props
}) => {
    const [proxyBody, setProxyBody] = useState(null);

    useEffect(() => {
        if (currentRecord) {
            setProxyBody(currentRecord);
        } else {
            setProxyBody({}); // Инициализируем пустым объектом для предотвращения ошибок
        }
    }, [currentRecord]);

    const onOkHandler = async () => {
        if (!proxyBody) return; // Проверка на null

        const record =
            currentRecord
                ? await ProxyBodyService.updateRecord({
                    id: currentRecord.id,
                    ...proxyBody,
                })
                : await ProxyBodyService.createRecord({ ...proxyBody, proxyHeaderId });

        onOk(record);
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
                        onChange={e => setProxyBody({ ...proxyBody, count: e.target.value })}
                        placeholder="Укажите количество"
                    />
                </Space>

            </Space>
        </Modal>
    );
};

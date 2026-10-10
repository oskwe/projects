import { Input, Space } from "antd";
import Modal from "antd/lib/modal/Modal";
import React, { useEffect, useState } from "react";
import AssetsService from "../../../api/invoice-services/assets-service";

export const AssetsDialog = ({
    visible,
    onOk,
    onCancel,
    currentRecord,
    ...props
}) => {
    const [asset, setAsset] = useState(null);

    useEffect(() => {
        if (currentRecord) {
            setAsset(currentRecord);
        } else {
            setAsset(null);
        }
    }, [currentRecord]);

    const onOkHandler = async () => {
        const record =
            currentRecord
                ? await AssetsService.updateRecord({
                    id: currentRecord.id,
                    ...asset,
                })
                : await AssetsService.createRecord(asset);
        onOk(record);
    };

    return (
        <Modal
            visible={visible}
            title={currentRecord ? 'Редактировать' : 'Создать'}
            onOk={onOkHandler}
            onCancel={onCancel}
        >

            <Space direction="horizontal">

                <Input
                    value={asset?.name || ''}
                    onChange={e => setAsset({ ...asset, name: e.target.value })}
                    placeholder="Укажите наименование"
                />

                <Input
                    value={asset?.nomenclature || ''}
                    onChange={e => setAsset({ ...asset, nomenclature: e.target.value })}
                    placeholder="Укажите номенклатуру"
                />

            </Space>
        </Modal>
    );
};
import { Input, Space } from "antd";
import Modal from "antd/lib/modal/Modal";
import React, { useEffect, useState } from "react";
import CorrespondentService from "../../../api/invoice-services/correspondent-service";

export const CorrespondentDialog = ({
    visible,
    onOk,
    onCancel,
    currentRecord,
    ...props
}) => {
    const [correspondent, setCorrespondent] = useState(null);

    useEffect(() => {
        if (currentRecord) {
            setCorrespondent(currentRecord);
        } else {
            setCorrespondent(null);
        }
    }, [currentRecord]);

    const onOkHandler = async () => {
        const record =
            currentRecord
                ? await CorrespondentService.updateRecord({
                    id: currentRecord.id,
                    ...correspondent,
                })
                : await CorrespondentService.createRecord(correspondent);
        onOk(record);
    };

    return (
        <Modal
            visible={visible}
            title={currentRecord ? 'Редактировать' : 'Создать'}
            onOk={onOkHandler}
            onCancel={onCancel}
        >

            <Space direction="vertical">

                <Input
                    type="number"
                    value={correspondent?.account || ''}
                    onChange={e => setCorrespondent({ ...correspondent, account: parseInt(e.target.value) || '' })}
                    placeholder="Укажите счет"
                />

                <Input
                    type="number"
                    value={correspondent?.code || ''}
                    onChange={e => setCorrespondent({ ...correspondent, code: parseInt(e.target.value) || '' })}
                    placeholder="Укажите код"
                />
                
                


            </Space>
        </Modal>
    );
};

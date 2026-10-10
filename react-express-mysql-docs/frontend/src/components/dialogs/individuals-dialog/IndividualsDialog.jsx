import { Input, Space } from "antd";
import Modal from "antd/lib/modal/Modal";
import React, { useEffect, useState } from "react";
import IndividualService from "../../../api/services/individuals-service";

export const IndividualsDialog = ({
    visible,
    onOk,
    onCancel,
    currentRecord,
    ...props
}) => {
    const [individual, setIndividual] = useState(null);

    useEffect(() => {
        if (currentRecord) {
            setIndividual(currentRecord);
        } else {
            setIndividual(null);
        }
    }, [currentRecord])

    const onOkHandler = async () => {
        const record =
            currentRecord
                ? await IndividualService.updateRecord({
                    id: currentRecord.id,
                    ...individual,
                })
                : await IndividualService.createRecord(individual)
        onOk(record);
    }

    return (
        <Modal
            visible={visible}
            title={currentRecord ? 'Редактировать' : 'Создать'}
            onOk={onOkHandler}
            onCancel={onCancel}
        >

            <Space direction="vertical">

                <Space>
                    <Input
                        value={individual?.lastName || ''}
                        onChange={e => setIndividual({ ...individual, lastName: e.target.value })}
                        placeholder="Укажите фамилию"
                    />

                    <Input
                        value={individual?.firstName || ''}
                        onChange={e => setIndividual({ ...individual, firstName: e.target.value })}
                        placeholder="Укажите имя"
                    />

                    <Input
                        value={individual?.patronymic || ''}
                        onChange={e => setIndividual({ ...individual, patronymic: e.target.value })}
                        placeholder="Укажите отчество"
                    />
                </Space>

                <Input
                    value={individual?.issued || ''}
                    onChange={e => setIndividual({ ...individual, issued: e.target.value })}
                    placeholder="Укажите, кем выдан документ"
                />

                <Space align="center">
                    <Input
                        value={individual?.series || ''}
                        onChange={e => setIndividual({ ...individual, series: e.target.value })}
                        placeholder="Укажите серию"
                    />

                    <Input
                        value={individual?.number || ''}
                        onChange={e => setIndividual({ ...individual, number: e.target.value })}
                        placeholder="Укажите номер"
                    />
                </Space>

            </Space>
        </Modal>
    )
}
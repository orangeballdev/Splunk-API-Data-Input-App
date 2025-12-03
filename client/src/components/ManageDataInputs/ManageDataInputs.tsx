import Pencil from '@splunk/react-icons/Pencil';
import Plus from '@splunk/react-icons/Plus';
import Button from '@splunk/react-ui/Button';
import Switch from '@splunk/react-ui/Switch';
import Table from '@splunk/react-ui/Table';
import Tooltip from '@splunk/react-ui/Tooltip';
import { useEffect, useState } from 'react';
/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
// @ts-ignore
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import Heading from '@splunk/react-ui/Heading';
import Menu from '@splunk/react-ui/Menu';
/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { _ } from '@splunk/ui-utils/i18n';
import { deleteConfigItemFromKVStore, fetchDataInputsData, parseSelectedOutput, updateDataInputConfigById } from '../../utils/dataInputUtils';
import type { DataInputAppConfig } from './DataInputs.types';
// import EditDataInputModal from './EditDataInput';
import React from 'react';
import EditIndexInputModal from './EditIndexInputModal';
import EditKVStoreInputModal from './EditKVStoreInputModal';


function ManageDataInputsTable() {
    const [openEditDataInputModal, setOpenEditDataInputModal] = useState<boolean>(false);
    const modalToggle = React.useRef<HTMLButtonElement | null>(null);
    const [selectedItem, setSelectedItem] = useState<DataInputAppConfig | null>(null);

    const [data, setData] = useState<DataInputAppConfig[]>([]);
    useEffect(() => {
        fetchDataInputsData(setData);
    }, []);

    const handleEditActionClick = (rowData: DataInputAppConfig) => () => {
        setOpenEditDataInputModal(true);
        setSelectedItem(rowData);
    };

    const refreshData = async () => {
        await fetchDataInputsData(setData);
    }

    const handleDeleteActionClick = (rowData: DataInputAppConfig) => async () => {
        await deleteConfigItemFromKVStore(rowData?._key || '');
        fetchDataInputsData(setData);
    };

    const handleEnabledToggle = (rowData: DataInputAppConfig) => async () => {
        const newEnabledValue = !rowData.enabled;
        
        // Update the local state immediately for better UX
        setData(prevData => 
            prevData.map(item => 
                item._key === rowData._key 
                    ? { ...item, enabled: newEnabledValue }
                    : item
            )
        );

        // Update the KVStore
        try {
            await updateDataInputConfigById({ ...rowData, enabled: newEnabledValue });
        } catch (error) {
            console.error('Failed to update enabled status:', error);
            // Revert on error
            setData(prevData => 
                prevData.map(item => 
                    item._key === rowData._key 
                        ? { ...item, enabled: rowData.enabled }
                        : item
                )
            );
        }
    };

    const handleViewDataActionClick = (rowData: DataInputAppConfig) => () => {
        if (rowData.input_type === 'kvstore') {
            const { collection } = parseSelectedOutput(rowData.selected_output_location);
            const url = `search?earliest=0&latest=&q=%7C%20inputlookup%20${encodeURIComponent(collection)}`;
            const newPath = window.location.pathname.replace(/\/[^/]+$/, `/${url}`);
            window.open(newPath, '_blank');
        } else if (rowData.input_type === 'index') {
            const indexName = rowData.selected_output_location;
            const url = `search?earliest=-24h&latest=now&q=index%3D${encodeURIComponent(indexName)}`;
            const newPath = window.location.pathname.replace(/\/[^/]+$/, `/${url}`);
            window.open(newPath, '_blank');
        } else {
            console.warn('View data action not implemented for input type:', rowData.input_type);
        }
    }

    const rowActionPrimaryButton = (rowData: DataInputAppConfig) => (
        <Tooltip
            content={_('Edit')}
            contentRelationship="label"
            onClick={handleEditActionClick(rowData)}
            style={{ marginRight: 8 }}
        >
            <Button appearance="subtle" icon={<Pencil variant="filled" />} />
        </Tooltip>
    );



    // Remove Add button from secondary actions
    const rowActionsSecondaryMenu = (rowData: DataInputAppConfig) => (
        <Menu>
            <Menu.Item onClick={handleDeleteActionClick(rowData)}>Delete</Menu.Item>
            <Menu.Item onClick={handleViewDataActionClick(rowData)}>View Data</Menu.Item>
        </Menu>
    );

    return (
        <div>
            {selectedItem?.input_type === 'index' ? (
                <EditIndexInputModal
                    onSuccess={refreshData}
                    onClose={() => setOpenEditDataInputModal(false)}
                    id={selectedItem?._key}
                    open={openEditDataInputModal}
                    modalToggle={modalToggle}
                />
            ) : (
                <EditKVStoreInputModal
                    onSuccess={refreshData}
                    onClose={() => setOpenEditDataInputModal(false)}
                    id={selectedItem?._key}
                    open={openEditDataInputModal}
                    modalToggle={modalToggle}
                />
            )}
            <ColumnLayout>
                <ColumnLayout.Row><ColumnLayout.Column span={10}>
                    <Heading style={{ marginBottom: "10px" }} level={1}>Manage Inputs</Heading>
                </ColumnLayout.Column>
                    <ColumnLayout.Column style={{ textAlign: "right" }} span={2}>
                        <Button
                            icon={<Plus />}
                            appearance="primary"
                            label="Add New"
                            onClick={() => {
                                window.location.pathname = window.location.pathname.replace(/\/[^/]+$/, '/add_new_input');
                            }}
                        />
                    </ColumnLayout.Column></ColumnLayout.Row>
            </ColumnLayout>
            <Table actionsColumnWidth={104}>
                <Table.Head>
                    <Table.HeadCell>Name</Table.HeadCell>
                    <Table.HeadCell>Input Type</Table.HeadCell>
                    <Table.HeadCell>Output Location</Table.HeadCell>
                    <Table.HeadCell>URL</Table.HeadCell>
                    <Table.HeadCell>Enabled</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                    {data.length > 0 ? (
                        Array.isArray(data) && data.map((row, idx) => (
                            <Table.Row
                                data={row}
                                key={row.name + idx}
                                actionPrimary={rowActionPrimaryButton(row)}
                                actionsSecondary={rowActionsSecondaryMenu(row)}
                            >
                                <Table.Cell>{row.name}</Table.Cell>
                                <Table.Cell>{row.input_type}</Table.Cell>
                                <Table.Cell>{row.selected_output_location}</Table.Cell>
                                <Table.Cell>{row.url}</Table.Cell>
                                <Table.Cell>
                                    <Switch
                                        selected={row.enabled}
                                        onClick={handleEnabledToggle(row)}
                                        appearance="toggle"
                                    />
                                </Table.Cell>
                            </Table.Row>
                        ))
                    ) : (
                        <Table.Row>
                            <Table.Cell colSpan={6} style={{ padding: '40px 0', verticalAlign: 'middle' }}>
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Heading level={1} style={{ fontWeight: 400, textAlign: 'center', width: '100%', margin: 0 }}>No Inputs Configured</Heading>
                                </div>
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
        </div>
    );
}

export default ManageDataInputsTable;

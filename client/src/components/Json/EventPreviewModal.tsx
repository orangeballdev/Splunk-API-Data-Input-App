import Button from '@splunk/react-ui/Button';
import { type JSONElement } from '@splunk/react-ui/JSONTree';
import Modal from '@splunk/react-ui/Modal';
import TabBar from '@splunk/react-ui/TabBar';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { generateSeparateEvents } from './arrayUtils';
import { removeByJsonPaths } from './utils';

interface EventPreviewModalProps {
    open: boolean;
    onClose: () => void;
    data: unknown;
    separateArrayPaths: string[];
    excludedJsonPaths?: string[];
    modalToggle: React.RefObject<HTMLButtonElement | null>;
}

const PreviewContainer = styled.div`
    max-height: 500px;
    overflow-y: auto;
`;

const EventCard = styled.div`
    background: #1e1e1e;
    border-radius: 4px;
    margin: 8px 0;
    overflow: hidden;
`;

const EventHeader = styled.div`
    background: #2d2d2d;
    padding: 8px 12px;
    font-size: 12px;
    color: #888;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const EventNumber = styled.span`
    color: #4fc3f7;
    font-weight: 500;
`;

const SourceBadge = styled.span`
    background: #3d5afe;
    color: white;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 11px;
`;

const EventBody = styled.pre`
    margin: 0;
    padding: 12px;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
    font-size: 12px;
    color: #403c3c;
    white-space: pre-wrap;
    word-break: break-all;
`;

const PaginationBar = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e0e0e0;
`;

const PageInfo = styled.span`
    color: #666;
    font-size: 14px;
`;

const EventPreviewModal: React.FC<EventPreviewModalProps> = ({
    open,
    onClose,
    data,
    separateArrayPaths,
    excludedJsonPaths = [],
    modalToggle
}) => {
    const [activeTab, setActiveTab] = useState<'processed' | 'original'>('processed');
    const [currentPage, setCurrentPage] = useState(0);
    const eventsPerPage = 10;

    // Apply excluded paths to data before generating events
    const filteredData = useMemo(() => {
        if (!data || excludedJsonPaths.length === 0) return data;
        try {
            return removeByJsonPaths(data as JSONElement, excludedJsonPaths);
        } catch (error) {
            console.error('Error filtering data:', error);
            return data;
        }
    }, [data, excludedJsonPaths]);

    const processedEvents = useMemo(() => {
        if (!filteredData) return [];
        return generateSeparateEvents(filteredData, separateArrayPaths);
    }, [filteredData, separateArrayPaths]);

    const totalPages = Math.ceil(processedEvents.length / eventsPerPage);
    const paginatedEvents = processedEvents.slice(
        currentPage * eventsPerPage,
        (currentPage + 1) * eventsPerPage
    );

    const handleTabChange = (_: React.SyntheticEvent, { selectedTabId }: { selectedTabId?: string }) => {
        if (selectedTabId) {
            setActiveTab(selectedTabId as 'processed' | 'original');
            setCurrentPage(0);
        }
    };

    const renderEvent = (event: unknown, _index: number, globalIndex: number) => {
        const eventObj = event as Record<string, unknown>;
        const sourceArray = eventObj._source_array as string | undefined;

        return (
            <EventCard key={globalIndex}>
                <EventHeader>
                    <EventNumber>Event #{globalIndex + 1}</EventNumber>
                    {sourceArray && <SourceBadge>from: {sourceArray}</SourceBadge>}
                </EventHeader>
                <EventBody>{JSON.stringify(event, null, 2)}</EventBody>
            </EventCard>
        );
    };

    return (
        <Modal
            open={open}
            onRequestClose={onClose}
            returnFocus={modalToggle}
            style={{ width: '800px' }}
        >
            <Modal.Header title="Event Preview - How data will appear in Splunk" />
            <Modal.Body>
                <TabBar activeTabId={activeTab} onChange={handleTabChange}>
                    <TabBar.Tab
                        label={`Processed Events (${processedEvents.length})`}
                        tabId="processed"
                    />
                    <TabBar.Tab
                        label="Original (1 event)"
                        tabId="original"
                    />
                </TabBar>

                <PreviewContainer>
                    {activeTab === 'processed' ? (
                        <>
                            

                            {separateArrayPaths.length === 0 ? (
                                <>
                                    
                                    <EventCard>
                                        <EventHeader>
                                            <EventNumber>Event #1</EventNumber>
                                        </EventHeader>
                                        <EventBody>{JSON.stringify(filteredData, null, 2)}</EventBody>
                                    </EventCard>
                                </>
                            ) : (
                                <>
                                    {paginatedEvents.map((event, idx) =>
                                        renderEvent(event, idx, currentPage * eventsPerPage + idx)
                                    )}

                                    {totalPages > 1 && (
                                        <PaginationBar>
                                            <Button
                                                appearance="secondary"
                                                disabled={currentPage === 0}
                                                onClick={() => setCurrentPage(p => p - 1)}
                                            >
                                                Previous
                                            </Button>
                                            <PageInfo>
                                                Page {currentPage + 1} of {totalPages}
                                            </PageInfo>
                                            <Button
                                                appearance="secondary"
                                                disabled={currentPage >= totalPages - 1}
                                                onClick={() => setCurrentPage(p => p + 1)}
                                            >
                                                Next
                                            </Button>
                                        </PaginationBar>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            
                            <EventCard>
                                <EventHeader>
                                    <EventNumber>Event #1</EventNumber>
                                </EventHeader>
                                <EventBody>{JSON.stringify(filteredData, null, 2)}</EventBody>
                            </EventCard>
                        </>
                    )}
                </PreviewContainer>
            </Modal.Body>
            <Modal.Footer>
                <Button appearance="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EventPreviewModal;

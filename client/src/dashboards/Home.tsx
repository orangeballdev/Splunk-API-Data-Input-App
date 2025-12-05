import Heading from '@splunk/react-ui/Heading';
import Paragraph from '@splunk/react-ui/Paragraph';
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  color: #ffffff;
`;

const InfoSection = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #ffffff;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  
  * {
    color: #ffffff !important;
  }
`;


const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 25px;
`;

const FeatureCard = styled.div`
  background: rgba(255,255,255,0.1);
  padding: 20px;
  border-radius: 6px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.3);
  
  * {
    color: #ffffff !important;
  }
`;

const TutorialsSection = styled.div`
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  
  * {
    color: #ffffff !important;
  }
`;

const TutorialsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const TutorialsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TourButton = styled.div`
  background: rgba(255,255,255,0.2);
  color: #ffffff;
  padding: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
  
  * {
    color: #ffffff !important;
  }

  &:hover {
    background: rgba(255,255,255,0.3);
    border-color: rgba(255,255,255,0.6);
    transform: translateX(4px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
`;

const DemoLink = styled.a`
  display: block;
  text-decoration: none;
  background: rgba(255,255,255,0.2);
  color: #ffffff;
  padding: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
  
  * {
    color: #ffffff !important;
  }

  &:hover {
    background: rgba(255,255,255,0.3);
    border-color: rgba(255,255,255,0.6);
    transform: translateX(4px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    text-decoration: none;
  }
`;

const SectionRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SupportSection = styled.div`
  background: linear-gradient(135deg, #2d3561 0%, #1f2937 100%);
  padding: 25px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  
  * {
    color: #ffffff !important;
    text-align: center !important;
  }
`;

const SupportLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.15);
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
  border: 2px solid rgba(255,255,255,0.25);
  margin-top: 12px;
  
  &:hover {
    background: rgba(255,255,255,0.25);
    border-color: rgba(255,255,255,0.4);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
`;

const HomeContent: React.FC = () => {
  const handleTourReplay = (tourKey: string, targetPath: string) => {
    localStorage.removeItem(tourKey);
    const basePath = window.location.pathname.split('/').slice(0, -1).join('/');
    window.location.href = `${basePath}/${targetPath}`;
  };

  const handleJsonTourReplay = () => {
    localStorage.removeItem('hasSeenJsonPreviewTour');
    const basePath = window.location.pathname.split('/').slice(0, -1).join('/');
    window.location.href = `${basePath}/add_new_input`;
  };

  return (
    <Container>
      <InfoSection>
        <Heading level={1}>API Data Input Connect</Heading>
        <Paragraph>
          Seamlessly pull data from any REST API into Splunk. Configure custom endpoints, map JSON responses with JSONPath, 
          and schedule automated data ingestion—all through an intuitive visual interface.
        </Paragraph>
        
        <FeaturesGrid>
          <FeatureCard>
            <Heading level={2}>Easy Integration</Heading>
            <Paragraph>Connect to any REST API with support for custom authentication methods</Paragraph>
          </FeatureCard>
          <FeatureCard>
            <Heading level={2}>Smart Mapping</Heading>
            <Paragraph>Use powerful JSONPath expressions to extract exactly the data you need</Paragraph>
          </FeatureCard>
          <FeatureCard>
            <Heading level={2}>Automation</Heading>
            <Paragraph>Schedule recurring data collection with flexible cron expressions</Paragraph>
          </FeatureCard>
          <FeatureCard>
            <Heading level={2}>Flexible Storage</Heading>
            <Paragraph>Store data in Splunk indexes or KV Store collections</Paragraph>
          </FeatureCard>
        </FeaturesGrid>
      </InfoSection>

      <TutorialsSection>
        <Heading level={3} style={{ marginBottom: '15px', marginTop: 0, fontSize: '24px' }}>Tutorials</Heading>
        <TutorialsContent>
          <SectionRow>
            <Heading level={2} style={{ fontSize: '18px', marginBottom: '8px' }}>Videos</Heading>
            <TutorialsRow>
              <DemoLink href="https://www.youtube.com/watch?v=NpEaa2P7qZI" target="_blank" rel="noopener noreferrer">
                <Heading level={2}>🎥 Demo Walkthrough</Heading>
                <Paragraph>Watch a complete walkthrough on YouTube</Paragraph>
              </DemoLink>
            </TutorialsRow>
          </SectionRow>
          <SectionRow>
            <Heading level={2} style={{ fontSize: '18px', marginBottom: '8px' }}>UI Walkthrough</Heading>
            <TutorialsRow>
              <TourButton onClick={() => handleTourReplay('hasSeenManageInputsTour', 'manage')}>
                <Heading level={2}>📋 Manage Inputs Tour</Heading>
                <Paragraph>View and navigate your data inputs</Paragraph>
              </TourButton>
              <TourButton onClick={() => handleTourReplay('hasSeenManageInputsTableTour', 'manage')}>
                <Heading level={2}>🔧 Table Actions Tour</Heading>
                <Paragraph>Edit, enable/disable, and manage inputs</Paragraph>
              </TourButton>
              <TourButton onClick={() => handleTourReplay('hasSeenNewDataInputTour', 'add_new_input')}>
                <Heading level={2}>➕ New Input Form Tour</Heading>
                <Paragraph>Create a new data input step-by-step</Paragraph>
              </TourButton>
              <TourButton onClick={handleJsonTourReplay}>
                <Heading level={2}>📊 JSON Viewer Tour</Heading>
                <Paragraph>Interact with JSON data and map fields</Paragraph>
              </TourButton>
            </TutorialsRow>
          </SectionRow>
        </TutorialsContent>
      </TutorialsSection>

      <SupportSection>
        <Heading level={3} style={{ marginBottom: '10px', fontSize: '22px' }}>Need Help or Have Ideas?</Heading>
        <Paragraph style={{ marginBottom: '15px', fontSize: '15px' }}>
          We're here to help! Contact us for support, bug reports, or feature requests.
        </Paragraph>
        <SupportLink href="mailto:splunk@orangeball.dev">
          <span>✉️</span>
          <span>splunk@orangeball.dev</span>
        </SupportLink>
      </SupportSection>
    </Container>
  );
};

export default HomeContent;

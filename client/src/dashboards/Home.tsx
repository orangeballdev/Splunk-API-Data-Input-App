import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
`;

const InfoSection = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #ffffff;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
`;

const Title = styled.h2`
  margin-top: 0;
  font-size: 28px;
  font-weight: 600;
  color: #ffffff;
`;

const Description = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #e8e8e8;
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

  h4 {
    margin-top: 0;
    font-size: 18px;
    margin-bottom: 10px;
    color: #ffffff;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #e0e0e0;
  }
`;

const TourSection = styled.div`
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  margin-bottom: 20px;

  h3 {
    color: #ffffff;
    font-size: 24px;
    margin-bottom: 10px;
    margin-top: 0;
  }

  > p {
    color: rgba(255,255,255,0.9);
    margin-bottom: 20px;
  }
`;

const TourButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
`;

const TourButtonCard = styled.div`
  background: rgba(255,255,255,0.2);
  color: #ffffff;
  padding: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255,255,255,0.3);
    border-color: rgba(255,255,255,0.6);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.2);
  }

  h4 {
    margin: 0 0 8px 0;
    font-size: 18px;
    color: #ffffff;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: rgba(255,255,255,0.9);
  }
`;

const VideoSection = styled.div`
  padding: 30px;
  background: linear-gradient(135deg, #00b4d8 0%, #0077b6 100%);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;

  h3 {
    color: #ffffff;
    font-size: 24px;
    margin-bottom: 20px;
    margin-top: 0;
    border-bottom: 3px solid rgba(255,255,255,0.3);
    padding-bottom: 10px;
  }
`;

const ResourcesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 15px;
`;

const ResourceCard = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #dee2e6;

  h4 {
    margin-top: 0;
    color: #1a1a2e;
    font-size: 18px;
    margin-bottom: 10px;
  }

  .coming-soon {
    display: block;
    margin-top: 8px;
    font-size: 12px;
    color: #f58f39;
    font-weight: bold;
  }

  .disabled-link {
    color: #999;
    text-decoration: none;
    font-weight: 500;
    opacity: 0.6;
    cursor: not-allowed;
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
        <Title>🚀 API Data Input Connect</Title>
        <Description>
          Seamlessly pull data from any REST API into Splunk. Configure custom endpoints, map JSON responses with JSONPath, 
          and schedule automated data ingestion—all through an intuitive visual interface.
        </Description>
        
        <FeaturesGrid>
          <FeatureCard>
            <h4>🔌 Easy Integration</h4>
            <p>Connect to any REST API with support for custom authentication methods</p>
          </FeatureCard>
          <FeatureCard>
            <h4>🎯 Smart Mapping</h4>
            <p>Use powerful JSONPath expressions to extract exactly the data you need</p>
          </FeatureCard>
          <FeatureCard>
            <h4>⏰ Automation</h4>
            <p>Schedule recurring data collection with flexible cron expressions</p>
          </FeatureCard>
          <FeatureCard>
            <h4>💾 Flexible Storage</h4>
            <p>Store data in Splunk indexes or KV Store collections</p>
          </FeatureCard>
        </FeaturesGrid>
      </InfoSection>

      <VideoSection>
        <h3>📺 Tutorial Videos</h3>
        <ResourcesGrid>
          <ResourceCard>
            <h4>Configuration Tutorial</h4>
            <span className="disabled-link">⏸ Watch Tutorial</span>
            <span className="coming-soon">COMING SOON</span>
          </ResourceCard>
          <ResourceCard>
            <h4>Advanced JSONPath Mapping</h4>
            <span className="disabled-link">⏸ Watch Tutorial</span>
            <span className="coming-soon">COMING SOON</span>
          </ResourceCard>
          <ResourceCard>
            <h4>Authentication Setup</h4>
            <span className="disabled-link">⏸ Watch Tutorial</span>
            <span className="coming-soon">COMING SOON</span>
          </ResourceCard>
        </ResourcesGrid>
      </VideoSection>

      <TourSection>
        <h3>🎓 Replay Tours</h3>
        <p>Click any button below to replay a tour and refresh your knowledge.</p>
        <TourButtonsGrid>
          <TourButtonCard onClick={() => handleTourReplay('hasSeenManageInputsTour', 'manage')}>
            <h4>📋 Manage Inputs Tour</h4>
            <p>Learn how to view and navigate your data inputs</p>
          </TourButtonCard>
          <TourButtonCard onClick={() => handleTourReplay('hasSeenManageInputsTableTour', 'manage')}>
            <h4>🔧 Table Actions Tour</h4>
            <p>Discover how to edit, enable/disable, and manage inputs</p>
          </TourButtonCard>
          <TourButtonCard onClick={() => handleTourReplay('hasSeenNewDataInputTour', 'add_new_input')}>
            <h4>➕ New Input Form Tour</h4>
            <p>Step-by-step guide for creating a new data input</p>
          </TourButtonCard>
          <TourButtonCard onClick={handleJsonTourReplay}>
            <h4>📊 JSON Viewer Tour</h4>
            <p>Learn how to interact with JSON data and map fields</p>
          </TourButtonCard>
        </TourButtonsGrid>
      </TourSection>
    </Container>
  );
};

export default HomeContent;

// src/pages/ExperimentDetail.jsx
import React from 'react';

const ExperimentDetail = ({ experiment, experimentTypes, onClose }) => {
  if (!experiment) return null;

  // 找到實驗類型的名稱
  const experimentTypeName = 
    experimentTypes.find(t => t.id === experiment.experiment_type)?.name || 
    experiment.experiment_type;

  // 根據實驗類型獲取對應的字段標籤
  const getFieldLabel = (fieldName) => {
    // 這裡可以添加更多實驗類型的字段標籤
    const fieldLabels = {
      eye_tracking: {
        fixation_count: '注視次數',
        saccade_count: '眼球跳動次數',
        average_pupil_size: '平均瞳孔大小 (mm)',
        focus_duration: '專注時間 (秒)',
        notes: '實驗備註'
      },
      heart_rate: {
        average_rate: '平均心率 (bpm)',
        max_rate: '最高心率 (bpm)',
        min_rate: '最低心率 (bpm)',
        variability: '心率變異性',
        notes: '實驗備註'
      },
      brain_activity: {
        alpha_waves: 'α波強度',
        beta_waves: 'β波強度',
        theta_waves: 'θ波強度',
        delta_waves: 'δ波強度',
        notes: '實驗備註'
      },
      skin_conductance: {
        base_level: '基礎水平 (μS)',
        response_amplitude: '反應振幅 (μS)',
        response_count: '反應次數',
        recovery_time: '恢復時間 (秒)',
        notes: '實驗備註'
      }
    };

    return fieldLabels[experiment.experiment_type]?.[fieldName] || fieldName;
  };

  return (
    <div className="experiment-detail-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>實驗詳情</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="detail-item">
            <span className="detail-label">勞工名稱：</span>
            <span className="detail-value">{experiment.worker_name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">實驗類型：</span>
            <span className="detail-value">{experimentTypeName}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">實驗時間：</span>
            <span className="detail-value">{new Date(experiment.experiment_time).toLocaleString()}</span>
          </div>
          
          <h3>實驗數據</h3>
          {experiment.data && Object.entries(experiment.data).map(([key, value]) => (
            <div className="detail-item" key={key}>
              <span className="detail-label">{getFieldLabel(key)}：</span>
              <span className="detail-value">{value}</span>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="button" onClick={onClose}>關閉</button>
        </div>
      </div>
    </div>
  );
};

export default ExperimentDetail;
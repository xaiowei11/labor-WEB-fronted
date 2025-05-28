// src/components/experimenter/ExperimentDetail.jsx
import React from 'react';

const ExperimentDetail = ({ experiment, experimentTypes, onClose }) => {
  if (!experiment) return null;

  // 找到實驗類型的名稱
  const experimentTypeName = 
    experimentTypes.find(t => t.id === experiment.experiment_type)?.name || 
    experiment.experiment_type;

  // 根據實驗類型獲取對應的字段標籤
  const getFieldLabel = (fieldName) => {
    const fieldLabels = {
      reaction_rod: {
        period_1_trial_1: '第一時段-第一次 (ms)',
        period_1_trial_2: '第一時段-第二次 (ms)',
        period_1_trial_3: '第一時段-第三次 (ms)',
        period_1_trial_4: '第一時段-第四次 (ms)',
        period_1_trial_5: '第一時段-第五次 (ms)',
        period_2_trial_1: '第二時段-第一次 (ms)',
        period_2_trial_2: '第二時段-第二次 (ms)',
        period_2_trial_3: '第二時段-第三次 (ms)',
        period_2_trial_4: '第二時段-第四次 (ms)',
        period_2_trial_5: '第二時段-第五次 (ms)',
        period_3_trial_1: '第三時段-第一次 (ms)',
        period_3_trial_2: '第三時段-第二次 (ms)',
        period_3_trial_3: '第三時段-第三次 (ms)',
        period_3_trial_4: '第三時段-第四次 (ms)',
        period_3_trial_5: '第三時段-第五次 (ms)',
        period_4_trial_1: '第四時段-第一次 (ms)',
        period_4_trial_2: '第四時段-第二次 (ms)',
        period_4_trial_3: '第四時段-第三次 (ms)',
        period_4_trial_4: '第四時段-第四次 (ms)',
        period_4_trial_5: '第四時段-第五次 (ms)',
        period_5_trial_1: '第五時段-第一次 (ms)',
        period_5_trial_2: '第五時段-第二次 (ms)',
        period_5_trial_3: '第五時段-第三次 (ms)',
        period_5_trial_4: '第五時段-第四次 (ms)',
        period_5_trial_5: '第五時段-第五次 (ms)',
        notes: '實驗備註'
      },
      flicker_test: {
        period_1_trial_1: '第一時段-第一次 (Hz)',
        period_1_trial_2: '第一時段-第二次 (Hz)',
        period_1_trial_3: '第一時段-第三次 (Hz)',
        period_1_trial_4: '第一時段-第四次 (Hz)',
        period_1_trial_5: '第一時段-第五次 (Hz)',
        period_2_trial_1: '第二時段-第一次 (Hz)',
        period_2_trial_2: '第二時段-第二次 (Hz)',
        period_2_trial_3: '第二時段-第三次 (Hz)',
        period_2_trial_4: '第二時段-第四次 (Hz)',
        period_2_trial_5: '第二時段-第五次 (Hz)',
        period_3_trial_1: '第三時段-第一次 (Hz)',
        period_3_trial_2: '第三時段-第二次 (Hz)',
        period_3_trial_3: '第三時段-第三次 (Hz)',
        period_3_trial_4: '第三時段-第四次 (Hz)',
        period_3_trial_5: '第三時段-第五次 (Hz)',
        period_4_trial_1: '第四時段-第一次 (Hz)',
        period_4_trial_2: '第四時段-第二次 (Hz)',
        period_4_trial_3: '第四時段-第三次 (Hz)',
        period_4_trial_4: '第四時段-第四次 (Hz)',
        period_4_trial_5: '第四時段-第五次 (Hz)',
        period_5_trial_1: '第五時段-第一次 (Hz)',
        period_5_trial_2: '第五時段-第二次 (Hz)',
        period_5_trial_3: '第五時段-第三次 (Hz)',
        period_5_trial_4: '第五時段-第四次 (Hz)',
        period_5_trial_5: '第五時段-第五次 (Hz)',
        notes: '實驗備註'
      },
      eye_tracking: {
        data_file: '眼動儀數據檔案',
        fixation_count: '注視次數',
        saccade_count: '眼球跳動次數',
        average_pupil_size: '平均瞳孔大小 (mm)',
        focus_duration: '專注時間 (秒)',
        notes: '實驗備註'
      },
      blood_pressure: {
        systolic_pressure: '收縮壓 (mmHg)',
        diastolic_pressure: '舒張壓 (mmHg)',
        heart_rate: '心率 (bpm)',
        measurement_time: '測量時間',
        notes: '實驗備註'
      }
    };

    return fieldLabels[experiment.experiment_type]?.[fieldName] || fieldName;
  };

  // 渲染實驗數據的函數，特別處理不同實驗類型的顯示方式
  const renderExperimentData = () => {
    if (!experiment.data) return null;

    // 如果是反應棒或閃爍劑實驗，以表格形式顯示
    if (experiment.experiment_type === 'reaction_rod' || experiment.experiment_type === 'flicker_test') {
      const periods = ['period_1', 'period_2', 'period_3', 'period_4', 'period_5'];
      const trials = ['trial_1', 'trial_2', 'trial_3', 'trial_4', 'trial_5'];
      const unit = experiment.experiment_type === 'reaction_rod' ? 'ms' : 'Hz';

      return (
        <div className="experiment-table-container">
          <table className="experiment-data-table">
            <thead>
              <tr>
                <th>{experiment.experiment_type === 'reaction_rod' ? '反應棒' : '閃爍劑'}</th>
                <th>第一時段</th>
                <th>第二時段</th>
                <th>第三時段</th>
                <th>第四時段</th>
                <th>第五時段</th>
              </tr>
            </thead>
            <tbody>
              {trials.map((trial, trialIndex) => (
                <tr key={trial}>
                  <td>第{trialIndex + 1}次</td>
                  {periods.map(period => {
                    const fieldName = `${period}_${trial}`;
                    const value = experiment.data[fieldName];
                    return (
                      <td key={fieldName}>
                        {value ? `${value} ${unit}` : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {experiment.data.notes && (
            <div className="detail-item">
              <span className="detail-label">實驗備註：</span>
              <span className="detail-value">{experiment.data.notes}</span>
            </div>
          )}
        </div>
      );
    }

    // 其他實驗類型使用原本的顯示方式
    return Object.entries(experiment.data).map(([key, value]) => (
      <div className="detail-item" key={key}>
        <span className="detail-label">{getFieldLabel(key)}：</span>
        <span className="detail-value">
          {key === 'data_file' && typeof value === 'string' ? (
            <a href={value} target="_blank" rel="noopener noreferrer">
              下載檔案
            </a>
          ) : key === 'measurement_time' && value ? (
            new Date(value).toLocaleString()
          ) : (
            value || '-'
          )}
        </span>
      </div>
    ));
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
          {renderExperimentData()}
        </div>
        <div className="modal-footer">
          <button className="button" onClick={onClose}>關閉</button>
        </div>
      </div>
    </div>
  );
};

export default ExperimentDetail;
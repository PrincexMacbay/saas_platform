import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const DigitalCard = () => {
  const { t } = useLanguage();
  const [cardConfig, setCardConfig] = useState({
    organizationName: t('digital.card.organization.name.placeholder'),
    cardTitle: t('digital.card.title.placeholder'),
    headerText: t('digital.card.member.since') + ' 2024',
    footerText: t('digital.card.thank.you'),
    enableBarcode: true,
    barcodeType: 'qr',
    barcodeData: 'member_number',
    primaryColor: '#3498db',
    secondaryColor: '#2c3e50',
    textColor: '#ffffff'
  });

  const [logoFile, setLogoFile] = useState(null);

  const handleColorChange = (field, color) => {
    setCardConfig(prev => ({ ...prev, [field]: color }));
  };

  const handleSave = () => {
    alert(t('digital.card.saved'));
  };

  return (
    <div className="digital-card-container">
      <div className="digital-card-header">
        <h2>{t('digital.card.title')}</h2>
        <button onClick={handleSave} className="save-button">
          <i className="fas fa-save"></i> {t('digital.card.save.template')}
        </button>
      </div>

      <div className="digital-card-content">
        <div className="card-config">
          <div className="config-section">
            <h3>{t('digital.card.information')}</h3>
            
            <div className="form-group">
              <label>{t('digital.card.organization.logo')}</label>
              <div className="logo-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                  style={{ display: 'none' }}
                  id="logo-upload"
                />
                <label htmlFor="logo-upload" className="upload-button">
                  <i className="fas fa-upload"></i> {t('digital.card.upload.logo')}
                </label>
                {logoFile && <span className="file-name">{logoFile.name}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label>{t('digital.card.organization.name')}</label>
              <input
                type="text"
                value={cardConfig.organizationName}
                onChange={(e) => setCardConfig(prev => ({
                  ...prev,
                  organizationName: e.target.value
                }))}
              />
            </div>
            
            <div className="form-group">
              <label>{t('digital.card.title.label')}</label>
              <input
                type="text"
                value={cardConfig.cardTitle}
                onChange={(e) => setCardConfig(prev => ({
                  ...prev,
                  cardTitle: e.target.value
                }))}
              />
            </div>
            
            <div className="form-group">
              <label>{t('digital.card.header.text')}</label>
              <input
                type="text"
                value={cardConfig.headerText}
                onChange={(e) => setCardConfig(prev => ({
                  ...prev,
                  headerText: e.target.value
                }))}
              />
            </div>
            
            <div className="form-group">
              <label>{t('digital.card.footer.text')}</label>
              <input
                type="text"
                value={cardConfig.footerText}
                onChange={(e) => setCardConfig(prev => ({
                  ...prev,
                  footerText: e.target.value
                }))}
              />
            </div>
          </div>

          <div className="config-section">
            <h3>{t('digital.card.barcode.settings')}</h3>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={cardConfig.enableBarcode}
                  onChange={(e) => setCardConfig(prev => ({
                    ...prev,
                    enableBarcode: e.target.checked
                  }))}
                />
                <span className="checkmark"></span>
                {t('digital.card.enable.barcode')}
              </label>
            </div>
            
            {cardConfig.enableBarcode && (
              <>
                <div className="form-group">
                  <label>{t('digital.card.barcode.type')}</label>
                  <select
                    value={cardConfig.barcodeType}
                    onChange={(e) => setCardConfig(prev => ({
                      ...prev,
                      barcodeType: e.target.value
                    }))}
                  >
                    <option value="qr">{t('digital.card.qr.code')}</option>
                    <option value="code128">Code 128</option>
                    <option value="code39">Code 39</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>{t('digital.card.barcode.data')}</label>
                  <select
                    value={cardConfig.barcodeData}
                    onChange={(e) => setCardConfig(prev => ({
                      ...prev,
                      barcodeData: e.target.value
                    }))}
                  >
                    <option value="member_number">{t('digital.card.member.number')}</option>
                    <option value="user_id">User ID</option>
                    <option value="custom">{t('digital.card.custom.text')}</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="config-section">
            <h3>{t('digital.card.color.settings')}</h3>
            
            <div className="color-group">
              <div className="color-input">
                <label>{t('digital.card.primary.color')}</label>
                <div className="color-picker">
                  <input
                    type="color"
                    value={cardConfig.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  />
                  <span>{cardConfig.primaryColor}</span>
                </div>
              </div>
              
              <div className="color-input">
                <label>{t('digital.card.secondary.color')}</label>
                <div className="color-picker">
                  <input
                    type="color"
                    value={cardConfig.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  />
                  <span>{cardConfig.secondaryColor}</span>
                </div>
              </div>
              
              <div className="color-input">
                <label>{t('digital.card.text.color')}</label>
                <div className="color-picker">
                  <input
                    type="color"
                    value={cardConfig.textColor}
                    onChange={(e) => handleColorChange('textColor', e.target.value)}
                  />
                  <span>{cardConfig.textColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-preview">
          <h3>{t('digital.card.preview')}</h3>
          <div className="preview-container">
            <div 
              className="membership-card"
              style={{
                background: `linear-gradient(135deg, ${cardConfig.primaryColor}, ${cardConfig.secondaryColor})`,
                color: cardConfig.textColor
              }}
            >
              <div className="card-header">
                <div className="logo-section">
                  {logoFile ? (
                    <img src={URL.createObjectURL(logoFile)} alt="Logo" className="logo" />
                  ) : (
                    <div className="logo-placeholder">
                      <i className="fas fa-image"></i>
                    </div>
                  )}
                </div>
                <div className="org-info">
                  <h3>{cardConfig.organizationName}</h3>
                  <p>{cardConfig.cardTitle}</p>
                </div>
              </div>

              <div className="card-body">
                <div className="member-info">
                  <h4>John Doe</h4>
                  <p>Member #MEM001234</p>
                  <p>{cardConfig.headerText}</p>
                </div>

                {cardConfig.enableBarcode && (
                  <div className="barcode-section">
                    <div className="barcode-placeholder">
                      {cardConfig.barcodeType === 'qr' ? (
                        <div className="qr-code">
                          <div className="qr-pattern"></div>
                        </div>
                      ) : (
                        <div className="barcode">
                          <div className="barcode-lines"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <p>{cardConfig.footerText}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .digital-card-container {
          padding: 30px;
        }

        .digital-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .digital-card-header h2 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.8rem;
        }

        .save-button {
          background: #27ae60;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.3s ease;
        }

        .save-button:hover {
          background: #219a52;
        }

        .digital-card-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .card-config {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 30px;
        }

        .config-section {
          margin-bottom: 40px;
        }

        .config-section:last-child {
          margin-bottom: 0;
        }

        .config-section h3 {
          margin: 0 0 20px 0;
          color: #2c3e50;
          font-size: 1.2rem;
          border-bottom: 1px solid #ecf0f1;
          padding-bottom: 10px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #2c3e50;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
        }

        .logo-upload {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .upload-button {
          background: #3498db;
          color: white;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .upload-button:hover {
          background: #2980b9;
        }

        .file-name {
          color: #27ae60;
          font-size: 0.9rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          gap: 10px;
        }

        .checkbox-label input {
          width: auto;
        }

        .color-group {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .color-input label {
          font-size: 0.9rem;
          margin-bottom: 5px;
        }

        .color-picker {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .color-picker input[type="color"] {
          width: 50px;
          height: 40px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .color-picker span {
          font-family: monospace;
          font-size: 0.9rem;
          color: #7f8c8d;
        }

        .card-preview {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 30px;
        }

        .card-preview h3 {
          margin: 0 0 20px 0;
          color: #2c3e50;
          font-size: 1.2rem;
          border-bottom: 1px solid #ecf0f1;
          padding-bottom: 10px;
        }

        .preview-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .membership-card {
          width: 320px;
          height: 200px;
          border-radius: 15px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .logo-section {
          width: 40px;
          height: 40px;
        }

        .logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 6px;
        }

        .logo-placeholder {
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        .org-info h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: bold;
        }

        .org-info p {
          margin: 2px 0 0 0;
          font-size: 0.8rem;
          opacity: 0.9;
        }

        .card-body {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .member-info h4 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: bold;
        }

        .member-info p {
          margin: 2px 0;
          font-size: 0.8rem;
          opacity: 0.9;
        }

        .barcode-section {
          width: 60px;
          height: 60px;
        }

        .qr-code {
          width: 100%;
          height: 100%;
          background: white;
          border-radius: 4px;
          position: relative;
        }

        .qr-pattern {
          width: 80%;
          height: 80%;
          background: black;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 2px;
        }

        .barcode {
          width: 100%;
          height: 30px;
          background: white;
          border-radius: 4px;
          position: relative;
        }

        .barcode-lines {
          width: 80%;
          height: 80%;
          background: repeating-linear-gradient(
            90deg,
            black 0px,
            black 2px,
            white 2px,
            white 4px
          );
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .card-footer {
          text-align: center;
        }

        .card-footer p {
          margin: 0;
          font-size: 0.7rem;
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .digital-card-container {
            padding: 20px;
          }

          .digital-card-header {
            flex-direction: column;
            gap: 20px;
            align-items: stretch;
          }

          .digital-card-content {
            grid-template-columns: 1fr;
          }

          .membership-card {
            width: 280px;
            height: 180px;
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default DigitalCard;

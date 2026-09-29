import React, { useState } from 'react';

// ── Stepper Component ──
const Stepper = ({ currentStep, labels }) => {
  const progressWidth =
    labels.length > 1
      ? `calc(${((currentStep - 1) / (labels.length - 1)) * 100}% - 2rem)`
      : '0%';

  return (
    <div className="stepper">
      <div className="stepper__line"></div>

      <div
        className="stepper__line--progress"
        style={{ width: progressWidth }}
      ></div>

      {labels.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div key={index} className="stepper__step">
            <div
              className={`stepper__dot ${
                isActive ? 'stepper__dot--active' : ''
              } ${isCompleted ? 'stepper__dot--completed' : ''}`}
            >
              {isCompleted && (
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>

            <span
              className={`stepper__label ${
                isActive || isCompleted
                  ? 'stepper__label--active'
                  : ''
              }`}
            >
              {stepNumber}. {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ── Main Page ──
const CreateTicketPage = () => {
  const [step, setStep] = useState(1);

  const [selection, setSelection] = useState({
    type: '',
    category: '',
    subCategory: '',
    module: '',
    description: '',
    attachment: null,
  });

  // ── Daftar Kategori per Tipe ──
  const IT_CATEGORIES = [
    {
      key: 'Application / System',
      title: 'Application / System',
      desc: 'Issues related to business applications or system.',
    },
    {
      key: 'Design',
      title: 'Design',
      desc: 'UI/UX, design assets, or design-related requests.',
    },
    {
      key: 'Network',
      title: 'Network',
      desc: 'Connectivity, VPN, internet, or network access issues.',
    },
    {
      key: 'Support',
      title: 'Support',
      desc: 'General IT support, troubleshooting, or assistance.',
    },
  ];

  const SAP_CATEGORIES = [
    {
      key: 'Master Data',
      title: 'Master Data',
      desc: 'Request to create, change, extend, or maintain SAP master data.',
    },
    {
      key: 'Support',
      title: 'Support',
      desc: 'Report an issue, error, or problem when using SAP.',
    },
  ];

  // ─────────────────────────────────────
  // STEPPER LABELS (DINAMIS)
  // Hanya 3 step, tapi label ke-3 bisa berubah
  // ─────────────────────────────────────
  const getStepLabels = () => {
    // Khusus SAP Master Data → label step 3 = "Sub Category"
    if (
      selection.type === 'SAP' &&
      selection.category === 'Master Data'
    ) {
      return ['Ticket Type', 'Category', 'Sub Category'];
    }

    // Sisanya → label step 3 = "Details"
    return ['Ticket Type', 'Category', 'Details'];
  };

  // ─────────────────────────────────────
  // BACK
  // ─────────────────────────────────────
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // ─────────────────────────────────────
  // NEXT
  // ─────────────────────────────────────
  const handleNext = () => {
    if (step === 1) {
      if (!selection.type) return;
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!selection.category) return;
      setStep(3);
      return;
    }

    // Step 3
    if (step === 3) {
      // Khusus SAP Master Data → tombol Next
      // (tahap selanjutnya belum diimplementasikan)
      if (
        selection.type === 'SAP' &&
        selection.category === 'Master Data'
      ) {
        if (!selection.subCategory) return;
        console.log(
          'Lanjut ke tahap selanjutnya (belum diimplementasikan):',
          selection
        );
        // Nanti: setStep(4) atau navigasi ke halaman lain
        return;
      }

      // Sisanya (IT, SAP Support) → Submit
      handleSubmit();
    }
  };

  // ─────────────────────────────────────
  // SUBMIT
  // ─────────────────────────────────────
  const handleSubmit = () => {
    console.log('Submitting:', selection);
    alert(
      `Tiket Berhasil Dibuat!\n\n` +
        `Tipe: ${selection.type}\n` +
        `Kategori: ${selection.category}\n` +
        `Sub: ${selection.subCategory || '-'}\n` +
        `Module: ${selection.module || '-'}\n` +
        `Desc: ${selection.description || '-'}`
    );
  };

  // ─────────────────────────────────────
  // SELECT TYPE
  // ─────────────────────────────────────
  const selectType = (type) => {
    setSelection((prev) => ({
      ...prev,
      type,
      category: '',
      subCategory: '',
      module: '',
      description: '',
      attachment: null,
    }));
  };

  // ─────────────────────────────────────
  // SELECT CATEGORY
  // ─────────────────────────────────────
  const selectCategory = (category) => {
    setSelection((prev) => ({
      ...prev,
      category,
      subCategory: '',
      module: '',
      description: '',
      attachment: null,
    }));
  };

  // ─────────────────────────────────────
  // INPUT
  // ─────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setSelection((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // ─────────────────────────────────────
  // SELECT SUB CATEGORY
  // ─────────────────────────────────────
  const selectSubCategory = (subCategory) => {
    setSelection((prev) => ({
      ...prev,
      subCategory,
    }));
  };

  // ─────────────────────────────────────
  // VALIDASI NEXT
  // ─────────────────────────────────────
  const isNextDisabled = () => {
    // Step 1
    if (step === 1 && !selection.type) return true;

    // Step 2
    if (step === 2 && !selection.category) return true;

    // Step 3 - SAP Master Data
    if (
      step === 3 &&
      selection.type === 'SAP' &&
      selection.category === 'Master Data' &&
      !selection.subCategory
    ) {
      return true;
    }

    // Step 3 - SAP Support
    if (
      step === 3 &&
      selection.type === 'SAP' &&
      selection.category === 'Support' &&
      (!selection.module || !selection.description)
    ) {
      return true;
    }

    return false;
  };

  // ─────────────────────────────────────
  // BUTTON LABEL
  // ─────────────────────────────────────
  const getNextButtonLabel = () => {
    if (step === 1) return 'Next';
    if (step === 2) return 'Next';

    // Step 3
    if (step === 3) {
      // Khusus SAP Master Data → Next
      if (
        selection.type === 'SAP' &&
        selection.category === 'Master Data'
      ) {
        return 'Next';
      }

      // Sisanya → Submit
      return 'Submit';
    }

    return 'Next';
  };

  // ─────────────────────────────────────
  // RENDER CONTENT
  // ─────────────────────────────────────
  const renderStepContent = () => {
    // ═══════════════════════════════════
    // STEP 1
    // ═══════════════════════════════════
    if (step === 1) {
      return (
        <div className="step-content">
          <h3 className="step-content__title">
            What type of issue do you need help with?
          </h3>

          <p className="step-content__subtitle">
            Select the category that best matches your request.
          </p>

          <div className="type-grid">
            <button
              type="button"
              className={`type-card ${
                selection.type === 'IT' ? 'type-card--selected' : ''
              }`}
              onClick={() => selectType('IT')}
            >
              <span className="type-card__title">IT</span>
              <span className="type-card__desc">
                Hardware, software, network, access, etc.
              </span>
            </button>

            <button
              type="button"
              className={`type-card ${
                selection.type === 'SAP' ? 'type-card--selected' : ''
              }`}
              onClick={() => selectType('SAP')}
            >
              <span className="type-card__title">SAP</span>
              <span className="type-card__desc">
                SAP master data, application support
              </span>
            </button>
          </div>
        </div>
      );
    }

    // ═══════════════════════════════════
    // STEP 2 - IT CATEGORY
    // ═══════════════════════════════════
    if (step === 2 && selection.type === 'IT') {
      return (
        <div className="step-content">
          <h3 className="step-content__title">IT Request Type</h3>
          <p className="step-content__subtitle">
            What kind of IT assistance do you need?
          </p>

          <div className="radio-list">
            {IT_CATEGORIES.map((item) => (
              <div
                key={item.key}
                className={`radio-card ${
                  selection.category === item.key
                    ? 'radio-card--selected'
                    : ''
                }`}
                onClick={() => selectCategory(item.key)}
              >
                <div className="radio-card__circle">
                  {selection.category === item.key && (
                    <div className="radio-card__circle-inner" />
                  )}
                </div>

                <div>
                  <h4 className="radio-card__title">{item.title}</h4>
                  <p className="radio-card__desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ═══════════════════════════════════
    // STEP 2 - SAP CATEGORY
    // ═══════════════════════════════════
    if (step === 2 && selection.type === 'SAP') {
      return (
        <div className="step-content">
          <h3 className="step-content__title">SAP Request Type</h3>
          <p className="step-content__subtitle">
            What kind of SAP assistance do you need?
          </p>

          <div className="radio-list">
            {SAP_CATEGORIES.map((item) => (
              <div
                key={item.key}
                className={`radio-card ${
                  selection.category === item.key
                    ? 'radio-card--selected'
                    : ''
                }`}
                onClick={() => selectCategory(item.key)}
              >
                <div className="radio-card__circle">
                  {selection.category === item.key && (
                    <div className="radio-card__circle-inner" />
                  )}
                </div>

                <div>
                  <h4 className="radio-card__title">{item.title}</h4>
                  <p className="radio-card__desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ═══════════════════════════════════
    // STEP 3 - SAP MASTER DATA
    // ═══════════════════════════════════
    if (
      step === 3 &&
      selection.type === 'SAP' &&
      selection.category === 'Master Data'
    ) {
      const subCategories = [
        'Customer',
        'Vendor',
        'Material',
        'User ID',
        'GL Form',
        'WBS',
        'Cost Center and Profit Center',
      ];

      return (
        <div className="step-content">
          <h3 className="step-content__title">SAP Master Data</h3>
          <p className="step-content__subtitle">What form do you need?</p>

          <div className="radio-list radio-list--compact">
            {subCategories.map((item) => (
              <div
                key={item}
                className={`radio-card ${
                  selection.subCategory === item
                    ? 'radio-card--selected'
                    : ''
                }`}
                onClick={() => selectSubCategory(item)}
              >
                <div className="radio-card__circle">
                  {selection.subCategory === item && (
                    <div className="radio-card__circle-inner" />
                  )}
                </div>

                <h4 className="radio-card__title">{item}</h4>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ═══════════════════════════════════
    // STEP 3 - SAP SUPPORT
    // ═══════════════════════════════════
    if (
      step === 3 &&
      selection.type === 'SAP' &&
      selection.category === 'Support'
    ) {
      return (
        <div className="step-content">
          <h3 className="step-content__title">SAP Support</h3>
          <p className="step-content__subtitle">What issue do you have?</p>

          <div className="support-form">
            {/* MODULE */}
            <div className="support-form__row">
              <label className="support-form__label">Module</label>
              <input
                type="text"
                name="module"
                value={selection.module}
                onChange={handleInputChange}
                className="support-form__input"
                placeholder="Enter module name"
              />
            </div>

            {/* DESCRIPTION */}
            <div className="support-form__row support-form__row--top">
              <label className="support-form__label">Description</label>
              <textarea
                name="description"
                value={selection.description}
                onChange={handleInputChange}
                className="support-form__textarea"
                placeholder="Describe your issue in detail..."
              />
            </div>

            {/* ATTACHMENT */}
            <div className="support-form__row">
              <label className="support-form__label">Attachment</label>
              <input
                type="file"
                name="attachment"
                onChange={handleInputChange}
                className="support-form__file"
              />
            </div>
          </div>
        </div>
      );
    }

    // ═══════════════════════════════════
    // STEP 3 - IT (KOSONG / PLACEHOLDER)
    // ═══════════════════════════════════
    if (step === 3 && selection.type === 'IT') {
      return <div className="step-content">{/* Kosong */}</div>;
    }

    return null;
  };

  // ═══════════════════════════════════
  // RENDER
  // ═══════════════════════════════════
  return (
    <div className="ticket-page">
      <div className="ticket-card">
        {/* HEADER */}
        <div className="ticket-card__header">
          <h2 className="ticket-card__title">Create Trouble Ticket</h2>
        </div>

        {/* BODY */}
        <div className="ticket-card__body">
          <Stepper currentStep={step} labels={getStepLabels()} />

          {renderStepContent()}

          {/* FOOTER */}
          <div className="ticket-footer">
            <button
              type="button"
              className="btn-ticket"
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </button>

            <button
              type="button"
              className={`btn-ticket ${
                !isNextDisabled() ? 'btn-ticket--primary' : ''
              }`}
              onClick={handleNext}
              disabled={isNextDisabled()}
            >
              {getNextButtonLabel()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTicketPage;
export function createMaterialActions(context) {
  const {
    approvalApi,
    isMaterialSubmission,
    submission,
    processing,
    setProcessing,
    setActionError,
    formLogic,
    formData,
    materialType,
    hasAccountingSaved,
    loadDetail,
    navigate,
    primaryButton,
    rejectButton,
    revisionButton,
    openRejectModal,
    openRevisionModal,
  } = context;

  const handleMaterialAction = async (action) => {
    if (!isMaterialSubmission) return;
    if (!submission || processing) return;

    try {
      setProcessing(true);
      setActionError("");

      let response;

      switch (action) {
        case "approve-divhead": {
          response = await approvalApi.approveDivHead(submission.id, "");
          break;
        }

        case "fill-accounting": {
          const result = formLogic?.getAccountingPayload(
            formData,
            materialType,
          );

          if (!result) {
            setActionError(
              "Aturan accounting untuk form ini belum dikonfigurasi.",
            );
            return;
          }

          if (result.error) {
            setActionError(result.error);
            return;
          }

          response = await approvalApi.fillAccounting(
            submission.id,
            result.payload,
            "",
          );
          break;
        }

        case "approve-accounting": {
          if (!hasAccountingSaved) {
            setActionError("Data accounting harus disimpan terlebih dahulu.");
            return;
          }

          response = await approvalApi.approveAccountingHead(submission.id, "");
          break;
        }

        case "resolve": {
          const result = formLogic?.getResolveInfo(formData, submission);

          if (!result) {
            setActionError(
              "Aturan resolve untuk form ini belum dikonfigurasi.",
            );
            return;
          }

          if (result.error) {
            setActionError(result.error);
            return;
          }

          response = await approvalApi.resolve(
            submission.id,
            result.code,
            "",
            result.isVendor,
            result.isMaterial,
          );

          window.alert(
            response?.data?.message || "Ticket berhasil diselesaikan.",
          );

          navigate("/approval");
          return;
        }

        default:
          return;
      }

      window.alert(response?.data?.message || "Action berhasil dilakukan.");

      await loadDetail();
    } catch (err) {
      console.error(err);

      setActionError(err.response?.data?.message || "Action gagal dilakukan.");
    } finally {
      setProcessing(false);
    }
  };

  const renderMaterialActionButtons = () => {
    if (!isMaterialSubmission || !submission) return null;

    const currentStatus = submission.status;

    if (currentStatus === "REVIEW_DIV_HEAD") {
      return (
        <div className="mt-6 flex gap-1.5 border-t border-slate-200 pt-4 flex-row items-center justify-end">
          <button
            type="button"
            className={rejectButton}
            onClick={openRejectModal}
            disabled={processing}
          >
            Reject
          </button>

          <button
            type="button"
            className={revisionButton}
            onClick={openRevisionModal}
            disabled={processing}
          >
            Revision
          </button>

          <button
            type="button"
            className={primaryButton}
            onClick={() => handleMaterialAction("approve-divhead")}
            disabled={processing}
          >
            {processing ? "Processing..." : "Approve"}
          </button>
        </div>
      );
    }

    if (
      currentStatus === "APPROVED_DIV_HEAD" &&
      !["YPRO", "ZCOM"].includes(materialType)
    ) {
      return (
        <div className="mt-6 flex gap-1.5 border-t border-slate-200 pt-4 flex-row items-center justify-end">
          <button
            type="submit"
            className={primaryButton}
            onClick={() => handleMaterialAction("resolve")}
            disabled={processing}
          >
            {processing ? "Processing..." : "Resolve"}
          </button>
        </div>
      );
    }

    if (
      [
        "APPROVED_DIV_HEAD",
        "REVISION_ACCOUNTING",
        "REVIEW_ACCOUNTING_HEAD",
      ].includes(currentStatus)
    ) {
      return (
        <div className="mt-6 flex gap-1.5 border-t border-slate-200 pt-4 flex-row items-center justify-end">
          {["APPROVED_DIV_HEAD", "REVISION_ACCOUNTING"].includes(
            currentStatus,
          ) && (
            <button
              type="submit"
              className={primaryButton}
              onClick={() => handleMaterialAction("fill-accounting")}
              disabled={processing}
            >
              {processing ? "Saving..." : "Save Accounting Data"}
            </button>
          )}

          {currentStatus === "REVIEW_ACCOUNTING_HEAD" && (
            <>
              <button
                type="button"
                className={rejectButton}
                onClick={openRejectModal}
                disabled={processing}
              >
                Reject
              </button>

              <button
                type="button"
                className={revisionButton}
                onClick={openRevisionModal}
                disabled={processing}
              >
                Revision
              </button>

              <button
                type="button"
                className={primaryButton}
                onClick={() => handleMaterialAction("approve-accounting")}
                disabled={processing || !hasAccountingSaved}
              >
                {processing ? "Processing..." : "Approve"}
              </button>
            </>
          )}
        </div>
      );
    }

    if (["APPROVED_ACCOUNTING_HEAD", "WAITING_PIC"].includes(currentStatus)) {
      return (
        <div className="mt-6 flex gap-1.5 border-t border-slate-200 pt-4 flex-row items-center justify-end">
          <button
            type="submit"
            className={primaryButton}
            onClick={() => handleMaterialAction("resolve")}
            disabled={processing}
          >
            {processing ? "Processing..." : "Resolve"}
          </button>
        </div>
      );
    }

    return null;
  };

  return { handleMaterialAction, renderMaterialActionButtons };
}

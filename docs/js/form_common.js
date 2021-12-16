(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  const initTabControl = () => {
    // Tab 切換
    $('.tab-controls').on('click', '.tab-option > li', function() {
      const idx = $(this).index();
      $(this).parent('ul').find('li').removeClass('in');
      $(this).addClass('in');
      const boxs = $(this).parents('.tab-controls').find('.tab-box');
      boxs.addClass('hide');
      boxs.eq(idx).removeClass('hide');
      $(this).trigger('customTabSwitch');
    });
    // Tab Initialize
    $('.tab-controls')
      .find('.tab-option > li')
      .each(function() {
        if ($(this).hasClass('in')) {
          const idx = $(this).index();
          const boxs = $(this).parents('.tab-controls').find('.tab-box');
          boxs.addClass('hide');
          boxs.eq(idx).removeClass('hide');
          $(this).trigger('customTabSwitch');
        }
      });
  };

  const getAttrDay = (attrValue = undefined) => {
    if (typeof attrValue === 'undefined') return 0
    const day = attrValue.match(/(\d+)/gi);
    if (!day || !day[0]) return 0
    return parseInt(day[0])
  };

  const getDefaultDate = ($picker) => {

    const dataDefault = $picker.data('default');
    const dataFormat = $picker.data('date-format');

    if (!dataDefault) return null
    else {

      // now 代表預設日期為 今天
      if (dataDefault === 'now') return moment()

      // now+3 代表預設日期為 3天後
      else if (dataDefault.startsWith('now+')) return moment().add(parseInt(dataDefault.replace('now+', '')), 'days')

      // now-3 代表預設日期為 3天前
      else if (dataDefault.startsWith('now-')) return moment().subtract(parseInt(dataDefault.replace('now-', '')), 'days')

      // 中間有 , 代表設定 "dateStr,format" 的格式
      else if (dataDefault.indexOf(',') > 0) {

        const [dateStr, format] = dataDefault.split(',');
        return moment(dateStr, format)
      }

      // 中間沒有 , 代表設定 "dateStr" 的格式
      else if (dataDefault.indexOf(',') < 1) return moment(dataDefault, dataFormat)
    }
  };

  const isStartDate = $picker => {

    const $datePickers = $picker.parent().find('input[data-date-format]');

    // 如果是單個 , 不會是 start_date
    if ($datePickers.length <= 1) return false

    // $picker 為 $startDate 時 , 必定為第一個 element
    return ($datePickers.index($picker) === 0)
  };

  const isEndDate = $picker => {

    const $datePickers = $picker.parent().find('input[data-date-format]');

    // 如果是單個 , 不會是 end_date
    if ($datePickers.length <= 1) return false

    // $picker 為 $endDate 時 , 必定為第二個 element
    return ($datePickers.index($picker) === 1)
  };

  const initInputDatetime = (thisDom) => {
    const dateConfig = {
      locale: 'zh-tw',
      useCurrent: false,
    };
    let plusday = 0;

    // 如果 html 上忘記設定 autocomplete='off' , 在此補上
    if (!thisDom.is('[autocomplete]')) thisDom.attr('autocomplete', 'off');

    if (thisDom.val() !== '') {
      const inputDom = thisDom.parent().find('input[data-date-format]');
      if (inputDom.length > 1) {
        const inputDomIndx = inputDom.index(thisDom);
        if (inputDomIndx === 0) dateConfig.maxDate = inputDom.eq(1).val();
        if (inputDomIndx === 1) dateConfig.minDate = inputDom.eq(0).val();
      }
    }

    // set start date configuration.
    if (thisDom.data('min-date')) {
      plusday = getAttrDay(thisDom.data('min-date'));
      dateConfig.minDate = moment().add(plusday, 'd').startOf('day');
    }

    if (thisDom.data('max-date') && !thisDom.data('time')) {
      plusday = getAttrDay(thisDom.data('max-date'));
      dateConfig.minDate = moment().add(plusday + 1, 'd').startOf('day');
    }

    /*
    // 處理日期的格式
    a = /(.*)(\d)(.*)/g
    b = '+1d'
    b.match(a)
    a.exec(b)

     */

    // default date
    const defaultDate = getDefaultDate(thisDom);
    if (defaultDate) dateConfig.date = getDefaultDate(thisDom);

    // 起始日改變時 , 更改 $endDate 的 minDate 跟 maxDate
    const onStartChange = ($startDate, $endDate) => {

      const startDate = $startDate.val() && moment($startDate.val(), $startDate.data('date-format'));

      // 如果 startDate 的 date 不存在時 , 不限制 $endDate 的 minDate . maxDate
      if (!startDate) {
        $endDate.data('DateTimePicker').minDate(false);
        if ($endDate.data('range-date')) $endDate.data('DateTimePicker').maxDate(false);
        return null
      }

      const plusEndDay = getAttrDay($endDate.data('max-date'));
      const limitRangeDay = getAttrDay($endDate.data('range-date'));

      // limitRangeDay 限制起始日 & 結束日只能間格 n 天
      if (limitRangeDay > 0) $endDate.data('DateTimePicker').maxDate(moment(startDate).add(limitRangeDay, 'd').endOf('d'));

      // plusEndDay 限制
      $endDate.data('DateTimePicker').minDate(moment(startDate).add(plusEndDay, 'd'));
    };

    // 結束日改變時 , 更改 $startDate 的 minDate 跟 maxDate
    const onEndChange = ($startDate, $endDate) => {

      const endDate = $endDate.data('DateTimePicker').date();

      if (!endDate) {
        if ($endDate.data('range-date')) $startDate.data('DateTimePicker').minDate(false);
        $startDate.data('DateTimePicker').maxDate(false);
        return null
      }

      const plusEndDay = getAttrDay($endDate.data('max-date'));
      const limitRangeDay = getAttrDay($endDate.data('range-date'));

      // limitRangeDay 限制起始日 & 結束日只能間格 n 天
      if (limitRangeDay > 0) $startDate.data('DateTimePicker').minDate(moment(endDate).subtract(limitRangeDay, 'd').startOf('d'));

      // plusEndDay 限制 起始日 & 結束日 最小間格 n 天
      $startDate.data('DateTimePicker').maxDate(moment(endDate).subtract(plusEndDay, 'd'));
    };

    thisDom
      .datetimepicker(dateConfig)
      .on('dp.show', function(e) {

        const $datePickers = $(this).parent().find('input[data-date-format]');
        const $startDate = $($datePickers[0]);
        const $endDate = $($datePickers[1]);

        if (isStartDate($(this))) onStartChange($startDate, $endDate);
        else if (isEndDate($(this))) onEndChange($startDate, $endDate);
      })
      .on('dp.change', function(e) {

        const $datePickers = $(this).parent().find('input[data-date-format]');
        const $startDate = $($datePickers[0]);
        const $endDate = $($datePickers[1]);

        if (isStartDate($(this))) onStartChange($startDate, $endDate);
        else if (isEndDate($(this))) onEndChange($startDate, $endDate);
      })
      .on('dp.error', function(err) {
        console.log('datetimepicker error', err);
        // alertMsg('日期選單','超出選擇的區間限制')
      });
  };

  window.initInputDatetime = initInputDatetime;

  const initDatePicker = () => {

    $('input[data-date-format]').each(function() {
      initInputDatetime($(this));
    });
  };

  const initTooltip = () => {

    // 商品名稱的 Tooltip
    const myTooltip = new jBox('Tooltip', {
      id: 'tooltip-wrap',
      attach: '.tooltip',
      adjustPosition: true,
      outside: 'y',
      position: {
        y: 'bottom',
      },
      maxWidth: '250px',
      onCreated: function() {

        registerScrollPosition($('#right-side > .header-wrapper + .content'), this);
      },
      onOpen: function() {

        const $currentTarget = this.target;
        $(this.content).parents('.jBox-Tooltip.jBox-wrapper#tooltip-wrap');
        $currentTarget.height() + 'px';
        $currentTarget.css('line-height');

        // 如果對象是 table 內的元素 & 單行的時候 , 不顯示  .tooltip
        // if ($currentTarget.parents('.table-result') && tdHeight === lineHeight) $tooltipWrap.addClass('z-basement')

        // 如果對象是 table 內的元素  & 多行的時候
        // else if (($currentTarget.parents('.table-result') && tdHeight !== lineHeight)) $tooltipWrap.removeClass('z-basement')
      },
    });

    // attachTooltip 方法
    window.attachTooltip = () => myTooltip.attach('.tooltip', 'mouseenter');

    // 註冊 document 監聽事件 , 讓事後追加的 .tooltip 元素 , 也可以顯示 Tooltip
    $(document).on('mouseenter', '.tooltip', () => attachTooltip().show());
  };

  const initForm = () => {

    // 計算輸入字數
    const $countMaxDoms = $('.count_max_character');
    if ($countMaxDoms) {
      // const showCount = countMaxDom.parent().find('em')
      $countMaxDoms.on('keyup', function() {
        const $countMax = $(this);
        const length = $countMax.val().replace(/[^\x00-\xff]/g, 'xx').length;
        $countMax.parent().find('em').text(length);
      });
    }

    //input只能輸入數字與逗點
    $('form').on('keypress', 'input.numComma', function(evt) {
      if ((evt.keyCode > 47 && evt.keyCode < 58) || evt.keyCode == 44) ; else {
        return false
      }
    });

    // 純數字框
    $('input.numberOnly').keypress(function(evt) {
      evt = evt ? evt : window.event;
      let charCode = evt.which ? evt.which : evt.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false
      }
    });

    // 只能輸入數字
    $('.table-result > table').on('keypress', 'input.numberOnly', function(evt) {
      evt = evt ? evt : window.event;
      let charCode = evt.which ? evt.which : evt.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false
      }
    });

    //input只能輸入數字與逗點
    $('input.numdot').on('keypress', function(evt) {
      if (!((evt.keyCode > 47 && evt.keyCode < 58) || evt.keyCode == 44)) {
        return false
      }
    });

    // 禁止輸入只能點選
    $('input.forbidText').keydown(function(evt) {
      return false
    });

    // 避免 button 執行預設的 form submit 行為
    $('button').on('click', e => e.preventDefault());

    // 避免 input 按 enter 時觸發 form submit
    // HTML form 只有一個 text input 時，在 input 上按 enter 會自動送出表單
    $('input[type="text"]').on('keypress', e => {

      // e.key = "Enter"
      if (e.keyCode === 13) e.preventDefault(); // 避免 enter 時 , 觸發 button click
    });
  };

  // 註冊 batch_input 的數量限制 ( ex : 最多可輸入 100 個序號 )
  const registerBatchInputLimit = ($batchInput, limit = 100) => {

    //function input limit
    const textlimit = (limit, dom) => {
      let arr;
      if (dom.val()) {
        dom.val().replace(/\s/ig, '');
        arr = dom.val().split(',').filter((item) => {
          return item && item.trim()
        });
        if (arr.length > limit) {
          let arrInput;
          arrInput = arr.slice(0, limit);
          dom.val(arrInput);
        }
      }
    };

    //input bind event limit 100
    $batchInput.on('keyup', function(e) {
      e.preventDefault();

      if (limit === 'useAttr') textlimit(parseInt($(this).attr('limit')), $(this));
      else textlimit(limit, $(this));
    });
  };

  // 檔案上傳
  function fileUpload({
                        formName = '#uploadForm',
                        uploadUrl = 'https://localhost:7000/upload',
                        successCallback,
                        errorCallback,
                        formData,
                        submitBtn,
                      }) {
    if (!formName) {
      console.warn('Please set form name for fileUpload');
      return false
    }

    // 檔案上傳進度條Set %
    const setUploadFileProgressBar = ($progressBar, percentage) => $progressBar.find('.progress-bar-striped').css('width', `${percentage}%`);

    const btnText = submitBtn.text();
    const $progressBar = $(`
    <div class='progress-btn'>
      <span>${btnText}</span>
      <div class='progress-bar progress-bar-animated progress-bar-striped' style='width: 0%'></div>
    </div>
  `);

    submitBtn.hide().after($progressBar);

    $progressBar.on('click', function() {

      if ($(this).hasClass('fail')) {
        $progressBar.remove();
        submitBtn.show();
      }
    });

    wait(500)
      .then(() => {

        $progressBar.addClass('progress');
        return wait(500)
      })
      .then(() => {

        $progressBar.addClass('noAfter');

        $.ajax({
          type: 'POST',
          url: uploadUrl,
          data: formData,
          enctype: 'multipart/form-data',
          cache: false,
          processData: false,
          contentType: false,
          success: function(data) {

            wait(600)
              .then(() => {

                $progressBar.addClass('done').removeClass('progress').removeClass('noAfter');

                // return Promise 物件 , 之後可接 .then
                return wait(2000)
              })
              .then(() => {

                $progressBar.remove();
                submitBtn.show();

                if (typeof successCallback === 'function') {
                  successCallback.call(this, data);
                }
              });

          },
          xhr: function() {
            const xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener(
              'progress',
              function(progressEvent) {
                // 監聽 ProgressEvent
                if (progressEvent.lengthComputable) {
                  const percentComplete = progressEvent.loaded / progressEvent.total;
                  const percentVal = Math.round(percentComplete * 100);
                  setUploadFileProgressBar($progressBar, percentVal);
                }
              },
              false,
            );
            return xhr
          },
        })
          .fail(function() {

            $progressBar.removeClass('done').removeClass('noAfter').removeClass('progress').addClass('fail');

            if (typeof errorCallback === 'function') {
              errorCallback.call();
            }
          });
      });
  }

  const initInputFile = () => {

    // 監聽檔案欄位選擇
    const fileListDom = $('.file-list-box');
    if (fileListDom) {

      // 如果下個元素是 input file , listen label click & trigger input file
      fileListDom.on('click', '.input-file-button', function() {
        const $nextEl = $(this).next();
        if ($nextEl.is('input[type="file"]')) $nextEl.trigger('click');
      });
      // listen input file
      fileListDom.on('change', 'input[type="file"]', function() {
        const thisDom = $(this);
        const fileInfo = $(this)[0].files[0];

        // 如果 fileInfo 不存在 = 沒選擇檔案 , 下方不做處理
        if (!fileInfo) return console.warn('請選擇檔案 , 才能上傳')

        const fileSize = (Math.floor(fileInfo.size / 1000) === 0) ? 1 : Math.floor(fileInfo.size / 1000);
        if (thisDom.data('maxsize')) {
          const limit = parseInt(thisDom.data('maxsize')) * 1024 * 1024;
          if (fileInfo.size > limit) {
            alertMsg(
              '上傳錯誤',
              '上傳檔案以' + thisDom.data('maxsize') + 'M為限！',
              'error',
            );
            thisDom.val('');
            return
          }
        }

        const accept = $(this).attr('accept');
        if (accept) {
          const validExts = accept.split(',');
          const fileName = fileInfo.name;
          const fileExt = fileName.substring(fileName.lastIndexOf('.'));
          if (validExts.indexOf(fileExt) < 0) {
            alertMsg('格式錯誤', '檔案格式不符，請重新確認！', 'error');
            return
          }
        }

        thisDom.valid();

        //只能上傳一筆
        if ($('.file-list >li').length > 0 && $('.onlyOneFile').length) {
          $('.file-list').find('li').eq(0).remove();
        }

        const fileListDom = $(this).closest('.rows').find('.file-list');
        const fileInputNameBox = $(this).parent().prev('.input-file-name');

        if (fileListDom.length > 0) {
          $(this).closest('.rows').find('.file-list').append(`
        <li class='file-${fileSize}'><i class='garbage'></i><i class='file'></i><font>${fileInfo.name}(${fileSize}kb)</font></li>
        `);
          $(`.file-${fileSize}`).on('click', 'i.garbage', function() {
            $(this).parent().remove();
            thisDom.val('');
            if (!$(this)[0].files) {
              $('.upload_contract_type_files_alert').removeClass('mt20');
            }
          });
        }

        if (fileInputNameBox.length > 0) {
          fileInputNameBox.val(fileInfo.name);
        }

        if ($(this)[0].files.length > 0) {
          $('.upload_contract_type_files_alert').addClass('mt20');
        }
      });

      // listen delete block
      fileListDom.on('click', 'span.trash', function() {
        const rowsDom = $(this).closest('.rows');
        rowsDom.next().remove();
        rowsDom.remove();
      });
    }
  };

  // 註冊函式到全域
  window.registerBatchInputLimit = registerBatchInputLimit;
  window.fileUpload = fileUpload;

  // 訪問 confirm 視窗 popup box
  let formDomObj = null;
  let formValidatorObj = null;

  /**
   * 顯示彈跳視窗
   * @param successHandler afterValidated
   * @param domHandler beforeOpen
   * @param formName
   * @param showContainer  specific block show
   * @param {object} externalValidate {rules, messages}
   * @param oncloseHandler invoke function after click reset.
   * @param otherValid overwrite submit-btn behavior
   * @param preventAutoClose disable invoke hidePopBox() after form valid success.
   */
  let showPopupBox = (
    successHandler, // afterValidated
    domHandler, // beforeOpen
    formName = 'form#changeReasonForm',
    showContainer, // specific block show
    externalValidate, // {rules, messages}
    oncloseHandler, // invoke function after click reset.
    otherValid, // overwrite submit-btn behavior
    preventAutoClose = false, // disable invoke hidePopBox() after form valid success.
  ) => {

    if (successHandler && typeof successHandler !== 'function') showPopupBoxFn(successHandler);
    else {

      showPopupBoxFn({
        afterValidated: successHandler,
        beforeOpen: domHandler,
        formName,
        showContainer,
        externalValidate,
        oncloseHandler,
        otherValid,
        preventAutoClose,
      });
    }
  };

  // 顯示彈跳視窗
  const showPopupBoxFn = ({
                            afterValidated, // afterValidated
                            beforeOpen, // beforeOpen
                            formName = 'form#changeReasonForm',
                            showContainer, // specific block show
                            externalValidate, // {rules, messages}
                            oncloseHandler, // invoke function after click reset.
                            otherValid, // overwrite submit-btn behavior
                            preventAutoClose = false, // disable invoke hidePopBox() after form valid success.
                          }) => {

    const getCurrentPopup = formName => typeof formName === 'object' ? formName : $(formName);
    formDomObj = getCurrentPopup(formName);

    // 如果 popupBox 中有多個 form 需要控制哪個做顯示
    if (showContainer) {
      const popupBox = $(formName).parents('.pop-up-box.change-reason');

      // hideAllChild => hide the .container.xxxForm
      popupBox.children().hide();

      // show the target .container.xxxForm
      popupBox.find(showContainer).show();

      // 參考資料 : https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
      // element which needs to be scrolled to
      const element = document.querySelector(showContainer);

      // scroll to element
      setTimeout(() => element.scrollIntoView({ block: 'center' }), 100);
    }

    // 支持同畫面多個 popupbox
    const container = formDomObj.parents('.pop-up-container');
    container.find('.pop-up-box').animate({ transform: 'scale(1)' }, 500);
    container.fadeIn(function() {
      container.css('display', 'flex');
      container.find('.pop-up-box').css('opacity', 1);
    });

    const doBeforeOpen = () => {

      // 更新目前 全選按鈕 的狀態 ( :checked . indeterminate . none )
      const updateCheckAll = ($table) => {

        const changeCheckAll = (columnId) => {

          // 全選按鈕
          const $checkAllEl = $table.find('thead').find(`th:nth-child(${columnId}) input[type="checkbox"][name="checkAllItems"]`);

          // 計算幾個 checkbox 被選擇
          const checkedNumber = $table.find('tbody').find(`td:nth-child(${columnId}) input[type="checkbox"]:checked`).length;

          // 總共有幾個 checkbox
          const totalNumber = $table.find('tbody').find(`td:nth-child(${columnId}) input[type="checkbox"]`).length;

          // 根據不同條件 , 控制 attr = indeterminate . checked , 改變顯示的 styling
          if (checkedNumber === 0) $checkAllEl.removeAttr('indeterminate').prop('checked', false);
          else if (checkedNumber === totalNumber) $checkAllEl.removeAttr('indeterminate').prop('checked', true);
          else $checkAllEl.attr('indeterminate', '').prop('checked', false);
        };

        // 找出有 input[name="checkAllItems"] 全選按鈕的那幾個 column , 然後針對 column 做處理
        // 全選的 checkbox , 全部命名為 input[name="checkAllItems"]
        const $checkAllEl = $table.find('thead').find(`input[type="checkbox"][name="checkAllItems"]`);

        $checkAllEl.each((index, checkAll) => {

          // $table.find('thead').find(`input[type="checkbox"][name="checkAllItems"]`).parents('th').index()
          const columnId = $(checkAll).parents('th').index() + 1;
          changeCheckAll(columnId);
        });
      };

      if (typeof beforeOpen === 'function') beforeOpen(formDomObj.parents('.pop-up-box'));
      formDomObj.find('.table-result > table').each((index, table) => updateCheckAll($(table)));
    };

    // 處理 popup 開啟前的行為
    doBeforeOpen();

    const rules = { ...(externalValidate?.rules || {}) };
    const messages = { ...(externalValidate?.messages || {}) };

    formDomObj.off('submit').on('submit', e => e.preventDefault());

    formValidatorObj = formDomObj.validate({
      ignore: ['.ignore'],
      rules: rules,
      messages: messages,
      submitHandler: function() {
        afterValidated.call();
        if (!preventAutoClose) hidePopBox(getCurrentPopup(formName));
      },
    });

    // 抓出 .reset-btn 跟 .submit-btn
    const containerEl = showContainer
      ? formDomObj.parents(showContainer)
      : formDomObj.parents('.pop-up-box');

    // set the pop-up-box close button
    containerEl
      .find('button.hide-pop-up-box.reset-btn')
      .off('click')
      .on('click', e => {
        e.preventDefault();
        hidePopBox(getCurrentPopup(formName));
        if (typeof oncloseHandler === 'function') oncloseHandler.call();
      });

    containerEl
      .find('button.hide-pop-up-box.submit-btn')
      .off('click')
      .on('click', function(e) {
        e.preventDefault();
        if (otherValid) otherValid.call();
        else formDomObj.submit();
      });
  };

  const hidePopBox = (currentPopup) => {
    if (formValidatorObj !== null) {
      try {
        formValidatorObj.destroy();
      } catch (e) {
      }
      formValidatorObj = null;
    }

    formDomObj = currentPopup;
    const container = formDomObj.parents('.pop-up-container');
    container.find('.popup-up-box').animate({ transform: 'scale(0)', opacity: 0 }, 500);
    setTimeout(() => container.fadeOut(300), 300);

    // reset form
    if (formDomObj && formDomObj.length) {
      formDomObj[0].reset();

      // reset input content
      formDomObj.find('.file-list').html('');

      // reset ckeditor content
      if (window.ckeditorCtrl) {

        // 只清除 formDomObj 中的 ckeditor
        const names = formDomObj.find('.ckeditor,#ckeditor')
          .toArray()
          .map(el => el.getAttribute('name'));

        window.ckeditorCtrl.resetEditors(names);
      }
    }
  };

  // 參考資料 : https://shopping.friday.tw/event/CP/friday_component/#block__message
  const showFridayMsgBox$1 = ({
                              onConfirm,
                              onCancel,
                              message = `是否確認申訴此<span class='text-red'>罰款單 1 筆</span>`,
                              isConfirm = true,
                              closeBtnTxt = '取消',
                              confirmBtnTxt = '確認',
                            } = {}) => {
    let btnArr = [
      {
        name: 'close',
        className: 'mr-1',
        text: closeBtnTxt,
        action: function() {
          // only for cancel
          alertUI.hide();

          // 確認後 , 執行的 callback
          if (onCancel) onCancel.call();
        },
      },
      {
        name: 'confirm',
        className: 'primary',
        text: confirmBtnTxt,
        action: function() {
          // do something after close
          alertUI.hide();

          // 確認後 , 執行的 callback
          if (onConfirm) onConfirm.call();
        },
      },
    ];
    if (!isConfirm) btnArr = [btnArr[0]];
    const fridayMsgBox = window.fridayComponent.MessageBox;
    const customCusBox = fridayMsgBox.template.fridayMessage({
      name: `friday_message-box-${new Date().getTime()}`,
      message,
      btnPos: 'right',
      btns: btnArr,
    });
    const alertUI = new fridayMsgBox(customCusBox);

    alertUI.isTriggerCloseOverlay = false; // isTriggerCloseOverlay = 是否 點選下方遮照可以關閉 MessageBox
    alertUI.init();
    alertUI.show();

    return alertUI
  };

  // 註冊函式到全域
  window.showPopupBox = showPopupBox;
  window.hidePopBox = hidePopBox;
  window.showFridayMsgBox = showFridayMsgBox$1;

  // addButton to toolbar : https://stackoverflow.com/questions/50730225/ckeditor5-balloon-build-clipboard-items-for-toolbar

  // 定義 Ckeditor 的控制器 , 可用 https://ckeditor.com/ckeditor-5/online-builder/ 來控制 JS 內的 Plugins 有哪些
  // 目前 plugin -
  class CkeditorCtrl {

    editors = []
    map = {}
    uploadUrl = 'https://localhost:7000/single-upload'

    setUploadUrl = uploadUrl => this.uploadUrl = uploadUrl

    /**
     * add editor to window.ckeditorCtrl.map
     * @param element 要被 ckeditor 替換的 element
     * @param type {string}[type=canEdit] ckeditor 的類型 ( canEdit . readOnly ... )
     * @param uploadUrl {string} ckfinder 的圖片上傳網址
     */
    addEditor(element, type = 'canEdit', uploadUrl = this.uploadUrl) {

      const self = this;

      const name = element.getAttribute('name');

      if (self.map[name]) throw new Error(`已有同名 (name=${name}) 元素 , 註冊 ckeditor , 請設定其他的 name`)

      const toolbarItemsMapper = {
        canEdit: [
          'sourceEditing', '|',
          /* 'copy', 'paste', '|', */
          'bold', 'italic', 'strikethrough', 'underline', '|',
          'alignment:left', 'alignment:center', 'alignment:right', 'alignment:justify', '|',
          'link', 'bulletedList', 'numberedList', 'blockQuote', '|',
          'imageUpload', /* 'mediaEmbed' 影片 , */ 'insertTable', 'undo', 'redo', '|',
          'fontsize', 'fontColor',
        ],
        readOnly: [
          'sourceEditing', '|',
          /* 'copy', 'paste', '|', */
          'bold', 'italic', 'strikethrough', 'underline', '|',
          'alignment:left', 'alignment:center', 'alignment:right', 'alignment:justify', '|',
          'link', 'bulletedList', 'numberedList', 'blockQuote', '|',
          'imageUpload', /* 'mediaEmbed' 影片 , */ 'insertTable', 'undo', 'redo', '|',
          'fontsize', 'fontColor',
        ],
        noToolBar: [],
      };

      ClassicEditor
        .create(element, {
          /* plugins: [ClipboardButtons], */
          // 避免 ckeditor 清除沒用到的 html 樣式 , 需要補上 htmlSupport.allow
          // 詳細資訊請參考 : https://ckeditor.com/docs/ckeditor5/latest/features/general-html-support.html#enabling-all-html-features
          htmlSupport: {
            allow: [
              {
                name: /.*/,
                attributes: true,
                classes: true,
                styles: true,
              },
            ],
          },
          fontSize: {
            options: [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72], // 表列需要用到的 "字體大小"
            // supportAllValues: true => 如果沒在 options 中 , 可能會出 font-size-invalid-use-of-named-presets 的 error
            // https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/error-codes.html#error-font-size-invalid-use-of-named-presets
          },
          toolbar: {
            items: toolbarItemsMapper[type],
            shouldNotGroupWhenFull: true, // 讓 toolbar 可以換行
          },
          image: {
            toolbar: [
              'imageTextAlternative',
              'imageStyle:inline',
              'imageStyle:block',
              'imageStyle:side',
            ],
          },
          language: 'zh',
          // 圖片上傳參考 : https://ithelp.ithome.com.tw/articles/10198816
          ckfinder: {
            // upload the images to the server using the CKFinder Quick
            uploadUrl: uploadUrl,
            options: {
              resourceType: 'Images',
            },
          },
        })
        .then((newEditor) => {

          // 查看的頁面 , ckeditor 不能編輯
          if (type !== 'canEdit') newEditor.isReadOnly = true;

          self.editors.push(newEditor);
          self.map[element.getAttribute('name')] = newEditor;
          newEditor.editing.view.document.on('change', () => $(element).valid());
        });
    }

    /**
     * clear window.ckeditorCtrl.editors & map
     */
    initEditor() {
      this.editors = [];
      this.map = {};
    }

    /**
     * reset editors content
     * @param names 綁定 element 的名稱
     */
    resetEditors(names) {

      if (names) {

        for (const name of names) {
          if (this.map[name]) this.map[name].setData('');
        }

      } else this.editors.forEach(editor => editor && editor.setData(''));
    }

    /**
     * use name to get the editor in window.ckeditorCtrl.map
     * @param name
     * @return {*} editor
     */
    getEditor(name) {
      return this.map[name]
    }

  }

  // 建立控制器 ckeditorCtrl
  window.ckeditorCtrl = new CkeditorCtrl();

  // 收集已設定的 debounce
  const debounceMap = {};

  function debounce(func, delay) {
    var timer = null;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(context, args), delay);
    }
  }

  /**
   * 產生延遲一秒效果的 function
   * <br>
   * 參考資料 :
   *  <a href='https://mropengate.blogspot.com/2017/12/dom-debounce-throttle.html'>
   *    https://mropengate.blogspot.com/2017/12/dom-debounce-throttle.html
   *  </a>
   * <br>
   * 使用範例 : getDebounceFunc('name', waitSec)(fn);
   * @param debounceId
   * @param wait
   * @return {(function(): void)|*}
   */
  const getDebounceFunc = (debounceId, wait = 1000) => {

    const tempFunc = debounceMap[`${debounceId}`];

    if (tempFunc) return tempFunc
    else {

      const newTempFunc = debounce(func => func(), wait);
      debounceMap[`${debounceId}`] = newTempFunc;
      return newTempFunc
    }
  };

  // 收集已設定的 throttle
  const throttleMap = {};

  function throttle(func, threshhold = 250) {
    var last, timer;
    return function() {
      var context = this;
      var args = arguments;
      var now = +new Date();
      if (last && now < last + threshhold) {
        clearTimeout(timer);
        timer = setTimeout(function() {
          last = now;
          func.apply(context, args);
        }, threshhold);
      } else {
        last = now;
        func.apply(context, args);
      }
    }
  }

  /**
   * 產生每一秒呼叫一次的 function
   * <br>
   * 參考資料 :
   *  <a href='https://mropengate.blogspot.com/2017/12/dom-debounce-throttle.html'>
   *    https://mropengate.blogspot.com/2017/12/dom-debounce-throttle.html
   *  </a>
   * <br>
   * 使用範例 : getThrottleFunc('name', waitSec)(fn);
   * @param throttleId
   * @param wait
   * @return {(function(): void)|*}
   */
  const getThrottleFunc = (throttleId, wait = 1000) => {

    const tempFunc = throttleMap[`${throttleId}`];

    if (tempFunc) return tempFunc
    else {

      const newTempFunc = throttle(func => func(), wait);
      throttleMap[`${throttleId}`] = newTempFunc;
      return newTempFunc
    }
  };

  // 註冊函式到全域
  window.getDebounceFunc = getDebounceFunc;
  window.getThrottleFunc = getThrottleFunc;

  // 全選按鈕的處理
  const registerCheckAll = ({
                              tableName, // 要註冊的目標 table 的名稱
                              columnId, // td 中的 checkbox 在第幾個 column 中
                            } = {}) => {

    const $table = $(tableName);

    // 全選的 checkbox , 大多命名為 input[name="checkAllItems"]
    const $checkAllEl = $table.find('thead').find(`th:nth-child(${columnId})  input[type="checkbox"]`);
    const $theadCheckAllEl = $table.parent().prevAll('.table-header.table-result').find('thead').find(`th:nth-child(${columnId})  input[type="checkbox"]`);

    const changeCheckAll = () => {
      const $checkAlls = $checkAllEl.add($theadCheckAllEl);

      // 計算幾個 checkbox 被選擇
      const checkedNumber = $table.find('tbody').find(`td:nth-child(${columnId})  input[type="checkbox"]:checked`).length;

      // 總共有幾個 checkbox
      const totalNumber = $table.find('tbody').find(`td:nth-child(${columnId})  input[type="checkbox"]`).length;

      // 根據不同條件 , 控制 attr = indeterminate . checked , 改變顯示的 styling
      if (checkedNumber === 0) $checkAlls.removeAttr('indeterminate').prop('checked', false);
      else if (checkedNumber === totalNumber) $checkAlls.removeAttr('indeterminate').prop('checked', true);
      else $checkAlls.attr('indeterminate', '').prop('checked', false);
    };
    changeCheckAll();

    // 表格 Checkbox Select ALL
    $checkAllEl.add($theadCheckAllEl)
      .on('click', function() {
        const isChecked = Boolean($(this).is(':checked'));
        $(this).removeAttr('indeterminate');  // indeterminate = 一槓的樣式
        $table.find('tbody').find(`td:nth-child(${columnId})  input[type="checkbox"]`).prop('checked', isChecked);
      });

    // 只選 td 中的幾項 , target checkbox 顯示一槓 indeterminate
    // click 需要註冊到 $table 上 , 避免有些 tbody 裡的 checkbox 是後來添加的沒註冊到 click 事件
    $table.on('click', `tbody tr td:nth-child(${columnId})  input[type="checkbox"]`, changeCheckAll);

    return {
      checkFn: changeCheckAll,
    }
  };

  class TableCtrl {

    static registerCheckAll = registerCheckAll

    static registerTableScrollable = (tableName) => {

      const getColgroup = $tr => {

        console.log($tr);

        const $colgroup = $('<colgroup></colgroup>');

        $tr.find('> th').each((index, th) => {

          const classArr = [...th.classList];

          for (const className of classArr) {

            if (className.startsWith('mw-')) return $colgroup.append($(`<col width='${className.replace('mw-', '')}' style='min-width:${className.replace('mw-', '')}px'>`))
          }
        });

        return $colgroup
      };

      const $tableResult = $(tableName).parent().first();
      const $trs = $tableResult.find('> table > thead > tr');
      const $colgroup = getColgroup($trs.first());

      $tableResult.find('> table > thead').before($colgroup);
      $tableResult.addClass('scrollable');

      const $theadWrap = $(`
              <div class='table-header table-result'>
                <table>
                  <thead>
                  </thead>
                </table>
              </div>
    `);

      $theadWrap.find('thead').append($trs.clone(true));
      $theadWrap.find('thead').before($colgroup.clone().append($('<col name="gutter" width="8">')));

      $tableResult.before($theadWrap);

      $tableResult.on('scroll', function() {

        $theadWrap.scrollLeft($(this).scrollLeft());
      });
    }

    // resort to origin
    static clearSorting = $table => {

      const $tbody = $table.find('> tbody');

      // 將 .indicator 的內容全拿掉
      const $indicator = $table.find('.indicator[sort]');
      $indicator.attr('sort', 'none').text('');

      for (let i = 1; i <= $tbody.find('> tr').length; i++) {

        $tbody.find(`tr[data-index='${i}']`).appendTo($tbody);
      }
    }

    static sorting = ({ tableName, sortBy, sort = 'asc' }) => {

      const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

      const $table = $(tableName);
      const $tbody = $(tableName).find('> tbody');
      const $indicator = $table.find(`.sort${capitalizeFirstLetter(sortBy)}`).find(`.indicator[sort][target="${sortBy}"]`);

      TableCtrl._sorting($indicator, $tbody, sort, sortBy);
    }

    static _sorting = ($indicator, $tbody, sort = 'asc', sortBy = '') => {

      // 1. 處理 .indicator 的內容
      if (sort === 'desc') $indicator.attr('sort', 'desc').text('▼');
      else $indicator.attr('sort', 'asc').text('▲');

      // 2. 算出 txnid 的順序
      const sortByIds = [...new Set($tbody.find(`> tr[data-${sortBy}]`).map((index, domElement) => $(domElement).attr(`data-${sortBy}`)).get())].sort();
      if (sort === 'desc') sortByIds.reverse();

      // 3. 照順序 appendTo $tbody
      sortByIds.forEach(id => $tbody.find(`tr[data-${sortBy}=${id}]`).appendTo($tbody));
    }

    static registerSort({ tableName, sortBy }) {

      const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

      const $table = $(tableName);
      const $tbody = $table.find('> tbody');

      // orderid => .sortOrderid
      $table.find(`.sort${capitalizeFirstLetter(sortBy)}`).on('click', function() {

        // const $sortTxnId = $(this)
        const $indicator = $(this).find(`.indicator[sort][target="${sortBy}"]`);
        const sort = ($indicator.attr('sort') === 'asc') ? 'desc' : 'asc';
        // ▲ ▼

        TableCtrl.clearSorting($table);
        TableCtrl._sorting($indicator, $tbody, sort, sortBy);
      });
    }
  }

  // 註冊函式到全域
  window.registerCheckAll = registerCheckAll;
  window.TableCtrl = TableCtrl;

  // Copy Text To Clipboard
  function clickToClipboard(e) {
    if (e.value === '') {
      return false
    }
    const copyText = e;
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */
    document.execCommand('copy');
    alert(copyText.value + '已複製到剪貼簿！');
  }

  // 等待 n 毫秒的函式
  function wait$1(millisecond = 1000) {
    return new Promise(resolve => setTimeout(resolve, millisecond))
  }

  /*!
   * Determine if an element is in the viewport
   * (c) 2017 Chris Ferdinandi, MIT License, https://gomakethings.com
   * @param  {Node}    elem The element
   * @return {Boolean}      Returns true if element is in the viewport
   */
  var isInViewport = function(elem, { left, top } = { left: 0, top: 0 }) {
    var distance = elem.getBoundingClientRect();
    return (
      distance.top >= top &&
      distance.left >= left &&
      distance.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      distance.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  };

  // 註冊 scroll 事件 , 讓 下拉選單 可以跟著 $selector 的位置移動
  const registerScrollPosition$1 = ($contents, myTooltip) => {

    if ($contents && $contents.length > 0) {

      $contents.on('scroll', () => {

        const $selector = myTooltip.target;

        // 如果畫面中看的到 -> myTooltip.position()
        if (isInViewport($selector.get(0))) myTooltip.position();

        // 如果畫面中看不到 -> myTooltip.close()
        else myTooltip.close();
      });
    }
  };

  // 開啟新分頁
  const openInNewTab = url => window.open(url, '_blank').focus();

  /**
   * 需提示使用者要先執行 XXX 才能換頁
   * @param needStopFn 需要阻止換頁的狀況 ()=>Boolean
   * @param message 提示文字
   */
  let registerPageChange = ({ needStopFn, message }) => {

    // 定義一個跳轉頁面的 function > 如果要在 JS 中定義換頁 , 需要執行這個 function
    window.changeUrl = url => {

      if (needStopFn()) {

        showFridayMsgBox({
          onConfirm: () => history.back(),
          onCancel: () => {

            // 再追加一個 歷史紀錄 到 history 中
            history.pushState({ flag: counter }, 'flag-tab', `?flag=${++counter}`);
          },
          message,
        });

      } else {

        // 跳轉到目標頁面
        window.location.href = url;
      }
    };

    let counter = 0;

    // 處理上一頁的那些事
    window.addEventListener('popstate', function(e) {

      if (needStopFn()) {

        showFridayMsgBox({
          onConfirm: () => history.back(),
          onCancel: () => {

            // 再追加一個 歷史紀錄 到 history 中
            history.pushState({ flag: counter }, 'flag-tab', `?flag=${++counter}`);
          },
          message,
        });

      } else {

        history.back();
      }
    });

    //監聽網址改變事件
    $('a').on('click', function(e) {
      // 取消超連結預設行為
      e.preventDefault();

      if (needStopFn()) {

        showFridayMsgBox({
          onConfirm: () => window.location.href = $(this).attr('href'),
          message,
        });

      } else {

        // 跳轉到目標頁面
        window.location.href = $(this).attr('href');
      }
    });

    history.pushState({ flag: counter }, 'flag-tab', `?flag=${++counter}`);
  };

  /**
   * 使用範例 : downloadFile().then( () => {} ).catch( e => console.error(e) )
   * 參考資料 : https://scarletsky.github.io/2016/07/03/download-file-using-javascript/
   * @param target 檔案的 url
   * @param filename 下載的檔案名稱
   * @return {Promise<void>}
   */
  async function downloadFile(target = './images/fridayLogo.png', filename = 'fridayLogo.png') {

    const res = await fetch(target); // 跨站下載 , 可能會有 cors 問題
    const blob = await res.blob();

    // 將 blob 下載下來
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // 如果無法載入圖片 , 顯示預設的圖片
  const defaultImage = 'data:image/png;base64,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';
  const setDefaultImage = (target, imgSrc = defaultImage) => target.src = imgSrc;

  // 註冊函式到全域
  window.clickToClipboard = clickToClipboard;
  window.wait = wait$1;
  window.isInViewport = isInViewport;
  window.registerScrollPosition = registerScrollPosition$1;
  window.openInNewTab = openInNewTab;
  window.registerPageChange = registerPageChange;
  window.downloadFile = downloadFile;
  window.setDefaultImage = setDefaultImage;

  class PrintCtrl {

    _doScreenshot = async target => {

      const canvas = await html2canvas(target, { scale: 4 });

      return canvas.toDataURL('image/jpeg')
    }

    _getBase64Pdf = (images = [], orientation) => {

      const orientationMapper = {
        landscape: 'l',
        portrait: 'p',
      };

      // add image to pdfJS , A4 = 210 x 297 mm , jsPDF 官方範例 : http://raw.githack.com/MrRio/jsPDF/master/
      const pdf = new window.jspdf.jsPDF(orientationMapper[orientation], 'mm', 'A4');

      for (let i = 0; i < images.length; i++) {

        // addImage 後兩個引數控制新增圖片的尺寸，此處將頁面高度按照a4紙寬高比列進行壓縮
        if (orientation === 'portrait') pdf.addImage(images[i], 'JPEG', 10, 10, 190, 275);
        else pdf.addImage(images[i], 'JPEG', 10, 10, 275, 190);

        if (i < images.length - 1) pdf.addPage(); // addPage 後的 addImage 會參考第二頁的 x . y 軸
      }

      // 產生 data:content/type;base64, 的字串
      const uriString = pdf.output('datauristring');

      return uriString.split('base64,')[1]
    }

    _printIt = async (iframeBody, orientation) => {

      const images = await Promise.all($(iframeBody).find('.main').toArray().map(target => this._doScreenshot(target)));
      printJS({ printable: this._getBase64Pdf(images, orientation), type: 'pdf', base64: true });
    }

    _appendIframe(target, url) {

      const $iframe = $(`<iframe width='670' height='1040' title='print page' frameborder='0' name='print-iframe'></iframe>`);

      // 有 url 就設定 iframe 的網址
      if (url) $iframe.get(0).src = url;

      // 將 $iframe 藏到後面 . 透明度改成 0 . 點不到
      $iframe.get(0).style = 'position: fixed;z-index: -3;opacity: 0;pointer-events: none;';

      // 將 iframe 加到畫面中
      $(target).append($iframe);

      return $iframe
    }

    getHtmlString({ url, data, method = 'post' }) {

      return new Promise((resolve, reject) => {

        // 參考資料 : https://juejin.cn/post/6844903779377086478
        //          https://juejin.cn/post/6844903623206371342
        $.ajax({
          url,
          type: method,
          contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
          // data: encodeURIComponent('ids=52,15,95'),
          // Form Data : a=1&b=2&c%5Ba%5D=1&c%5Bb%5D=2
          data,
          success: function(result) { // result is html

            const $html = $('<div/>').html(result);

            // 取得設定的 css 樣式
            const $styles = $html.find('link[rel="stylesheet"]');

            // 取得每一頁 .main
            const $mains = $html.find('.main');

            const $newDiv = $('<div></div>');
            $newDiv.append($styles);
            $newDiv.append($mains);

            // 轉換成 htmlString 並回傳
            resolve($newDiv.html());
          },
          error: function(jqXHR, textStatus, errorThrown) {
            // Your error handling logic here..
            reject(textStatus); // result is html
          },
        });
      })
    }

    /**
     * 直接打開列印 Panel , 列印 A4 頁面
     * @param target 要將 iframe append 到哪
     * @param url 要列印的頁面
     * @param html 可以 override iframeBody 內的 html
     * @param orientation A4 方向 , 有 landscape = 橫式 . portrait = 直式
     */
    print({ target = '#right-side > .header-wrapper + .content .main', url, orientation = 'portrait', htmlStr } = {}) {

      if (!target) throw new Error('iframe cannot append be undefined target')

      const $iframe = this._appendIframe(target, url);

      if (url) {

        // $iframe 的 body 載入完成後 , 才做列印的動作
        $iframe.get(0).onload = () => {

          const iframeBody = $iframe.get(0).contentWindow.document.body;

          // setTimeout 0.1 秒 , 避免 iframeBody 的內容是空的
          setTimeout(() => {

            this._printIt(iframeBody, orientation)
              .then(() => {
                console.log('success open print dialog');
                $iframe.remove();
              })
              .catch(console.error);

          }, 100);
        };

      } else {

        const iframeBody = $iframe.get(0).contentWindow.document.body;

        // 將 iframeBody 的內容覆蓋掉
        $(iframeBody).html(htmlStr);
        iframeBody.style.display = 'block';

        this._printIt(iframeBody, orientation)
          .then(() => {
            console.log('success open print dialog');
            $iframe.remove();
          })
          .catch(console.error);
      }
    }
  }

  window.PrintCtrl = PrintCtrl;

  // document.ready 後才做的事情
  $(function() {

    // tab 初始化
    initTabControl();

    // 日期初使化
    initDatePicker();

    // Tooltip 初使化
    initTooltip();

    // form 中的欄位事件綁定
    initForm();

    // 註冊 input file 事件
    initInputFile();
  });

}));

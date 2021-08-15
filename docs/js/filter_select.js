window.initFilterSelect = () => {

    const clickOutSide = (element, fn) => {

        document.addEventListener('click', (evt) => {

            let targetElement = evt.target // clicked element

            do {

                // This is a click inside. Do nothing, just return.
                if (targetElement === element) return

                // Go up the DOM
                targetElement = targetElement.parentNode
            } while (targetElement)

            // This is a click outside.
            fn()

        }, true)
    }

    // 將 fri-dropdown 的基礎框 append 到 body 最後面
    $('body').append(`
    <div class='fri-dropdown'>
      <div class='fri-select-dropdown__wrap fri-scrollbar__wrap'>
        <ul class='fri-select-dropdown__list'>
        </ul>
      </div>
    </div>
  `)

    // 如果 selector 有預設值時 , 將對應 text 設定給 input
    const setSelectorInputText = (selector) => {
        // 將 data-value 對應的 data-json 上的 text 值設定到 target 上
        const jsonData = JSON.parse($(selector).attr('data-json') || '[]')
        const dataValue = $(selector).attr('data-value')
        const placeholder = $(selector).attr('placeholder') || ''
        const dataTextObj = jsonData.find(item => dataValue === item.value)
        if (dataTextObj) selector.querySelector('input').value = dataTextObj.text
        else {
            selector.setAttribute('data-value', '')
            selector.querySelector('input').value = ''
            selector.querySelector('input').setAttribute('placeholder', placeholder)
        }
    }

    const renderSingleSelector = (selector) => {

        const notEqual = (a, b) => (a && a.toLowerCase()) !== (b && b.toLowerCase())

        const $selector = $(selector)
        const $input = $(`<input type='text' autocomplete='off'>`) // create input element
        $input.attr('placeholder', $selector.attr('placeholder'))

        // clone all attrs , without id , data-json & data-value
        const attributes = $selector.prop('attributes')
        $.each(attributes, function () {
            if (
                notEqual('id', this.name) &&
                notEqual('data-json', this.name) &&
                notEqual('data-value', this.name)
            )
                $input.attr(this.name, this.value)
        })
        $input.removeClass('filter-select') // 不能讓 $input 有 .filter-select 不然 dropdown 的顯示運作會異常

        $selector.append($input)
        $selector.append(`<i class='close'></i>`)
        $selector.append(`<i class='arrow'></i>`)
        $selector.append(`<div class='corner'></div>`)
        setSelectorInputText($selector[0])
    }

    const $filterSelect = $('.filter-select')

    $filterSelect.each(function () {
        renderSingleSelector($(this).get(0))
    })

    // 將 dropDown 掛到 .filter-select 上面
    const myTooltip = new jBox('Tooltip', {
        attach: '.filter-select',
        content: $('.fri-dropdown'),
        trigger: 'click',
        adjustPosition: true,
        outside: 'y',
        position: {
            y: 'bottom',
        },
        addClass: 'select-dropdown',
        onCreated: function () {

            // 如果 click 在 $dropdown 外側 , 關閉 myTooltip
            clickOutSide(this.content[0], () => this.close())
        },
        onOpen: function () {

            const $currentSelector = this.target

            const scrollHeight = $currentSelector.attr('scroll-height')
            this.setHeight(scrollHeight) // 設定 undefined = 清除之前的設定

            // 切換到其他欄位時 , 將 DataValue 的值 塞到 input 中
            this.attachedElements.forEach(selector => {

                const $selector = $(selector)
                if ($selector.hasClass('opened') && selector !== $currentSelector.get(0)) $selector.attr('data-mode', 'view')
            })

            $currentSelector.attr('data-mode', 'edit')
        },
        onClose: function () {
            const $selector = this.target
            $selector && ($selector.attr('data-mode') !== 'create') && $selector.attr('data-mode', 'view')
        },
    })

    function dropdownListMutation(mutationList) {
        mutationList.forEach(function (mutation) {

            // console.log('mutation=', mutation)

            if (mutation.attributeName === 'data-json' && mutation.type === 'attributes') {

                setSelectorInputText(mutation.target)
                myTooltip.close()

            } else if (mutation.attributeName === 'data-mode' && mutation.type === 'attributes') {

                const setValueToPlaceholder = $selector => {

                    const dataJson = JSON.parse($selector.attr('data-json') || '[]')
                    const dataValue = $selector.attr('data-value')
                    const textObj = dataJson.find(obj => obj.value === dataValue)
                    const $input = $selector.find('input')
                    $input.val('')
                    $input.removeAttr('readonly')
                    if (textObj) $input.attr('placeholder', textObj.text)
                }

                const setDataValueToInput = $selector => {

                    const dataJson = JSON.parse($selector.attr('data-json') || '[]')
                    const dataValue = $selector.attr('data-value')
                    const textObj = dataJson.find(obj => obj.value === dataValue)
                    if (textObj) $selector.find('input').val(textObj.text)
                    $selector.find('input').attr('readonly', '')
                }

                // mode : edit . view . nodata 三種模式
                const $selector = $(mutation.target)
                const $input = $selector.find('input')
                const mode = $selector.attr('data-mode')
                const attributeOldValue = mutation.oldValue

                switch (mode) {

                    case 'edit':

                        // 清空 input 內容 , 將 data-value 改成 placeholder 值
                        setValueToPlaceholder($selector)
                        $selector.addClass('opened')

                        // render dropdownList 的資料
                        const dropdownList = myTooltip.content[0].querySelector('.fri-select-dropdown__list')
                        renderDropdownList($(dropdownList), $selector.get(0))

                        break

                    // 切換到 view mode 時 , 將 data-value 塞到 input 的 value 中
                    case 'view':

                        setDataValueToInput($selector)
                        $selector.removeClass('opened')
                        break

                    // 切換到 create mode 時 , 將
                    case 'create':

                        $input.attr('placeholder', $selector.attr('create-mode-text') || '請自由鍵入資料')  // 設定新的 placeholder
                        $selector.removeClass('opened')
                        myTooltip.detach($selector)
                        myTooltip.close()
                        break

                    case 'nodata':

                        $selector.removeClass('has-data')
                        $selector.attr('data-value', '')
                        $input.attr('placeholder', $selector.attr('placeholder') || '')  // 將 placeholder 設定回原本的
                        $input.val('').trigger('change') // 需要在設定 data-value 後再 trigger('change')
                        if (attributeOldValue === 'create') myTooltip.attach()
                        else myTooltip.close()
                        break
                }

            } else if (mutation.attributeName === 'disabled' && mutation.type === 'attributes') {

                const $selector = $(mutation.target)
                const $input = $selector.find('input')
                const isDisabled = Boolean($selector.attr('disabled'))

                if (isDisabled) {

                    $input.attr('disabled', isDisabled)
                    myTooltip.detach($selector)

                } else {

                    $input.removeAttr('disabled')
                    myTooltip.attach($selector)
                }
            }
        })
    }

    function renderDropdownList(div, selector) {
        const $selector = $(selector)
        const data = JSON.parse($selector.attr('data-json') || '[]')
        const noMatchText = $selector.attr('no-match-text') || '無對應資料' // 篩選條件沒資料 : 無對應資料
        const noDataText = $selector.attr('no-data-text') || '資料尚未載入' // 沒有預設選項 : 資料尚未載入
        const isLoading = ($selector.attr('data-mode') === 'loading')
        const $input = $selector.find('input')
        const filterStr = $input.val()
        const selectedValue = $selector.attr('data-value')
        div.html('')

        const filteredData = data.filter((obj) => obj.text.indexOf(filterStr) > -1)

        // 載入中
        if (isLoading) {
            const $li = $(`<li class='fri-select-dropdown__item info'><span>資料載入中</span></li>`)
            div.append($li)

            // 沒有預設選項 : 資料尚未載入
        } else if (data.length === 0) {
            const $li = $(`<li class='fri-select-dropdown__item info'><span>${noDataText}</span></li>`)
            div.append($li)

            // 篩選條件沒資料 : 無對應資料
        } else if (filteredData.length === 0) {
            const $li = $(`<li class='fri-select-dropdown__item info'><span>${noMatchText}</span></li>`)
            div.append($li)

            // 有資料
        } else {
            filteredData.forEach(({text, value}) => {

                const $li = $(`<li class='fri-select-dropdown__item' data-value='${value}' data-text='${text}'></li>`)

                const $textWrap = $(`<span>${text}</span>`)
                $textWrap.html(text.replace(/\S/g, '<font>$&</font>'))
                $textWrap.children().each(function () {

                    const $font = $(this)
                    const char = $font.text()
                    if (filterStr.indexOf(char) > -1) $font.addClass('text-red font-900')
                })

                $li.append($textWrap)
                $li.click(() => {

                    const clickedValue = $li.attr('data-value')
                    const allowCreate = $selector.attr('allow-create')

                    if (allowCreate && clickedValue === allowCreate) {

                        $selector.attr('data-mode', 'create')

                    } else {

                        $selector.attr('data-value', $li.attr('data-value'))
                        $input.val($li.attr('data-text'))
                        $input.trigger('change')
                        myTooltip.close()
                    }

                })

                if (value === selectedValue) $li.addClass('selected')

                div.append($li)
            })
        }

        myTooltip.position(selector) // Recalculates your jBoxes position.
    }

    function bindFilterSelectEvents(filterSelect) {

        const observer = new MutationObserver(dropdownListMutation)
        observer.observe(filterSelect, {
            attributes: true,
            attributeOldValue: true,
        })

        // 進入時 , 確認有沒有資料
        $(filterSelect).on('mouseenter', function (e) {
            const $selector = $(this)
            if ($selector.find('input').val()) {
                $selector.addClass('has-data')
            }
        })

        // 離開時 , 永遠顯示 i.arrow
        $(filterSelect).on('mouseleave', function (e) {
            $(e.currentTarget).removeClass('has-data')
        })

        $(filterSelect).find('input').on('keyup', function (e) {

            const $selector = $(this).parent()

            if ($selector.data('mode') === 'create') {

                $selector.attr('data-value', $(this).val())

            } else {

                const dropdownList = myTooltip.content[0].querySelector('.fri-select-dropdown__list')
                renderDropdownList($(dropdownList), $selector.get(0))
            }
        })

        // 清除資料...
        $(filterSelect).find('i.close').on('click', function (e) {
            e.stopPropagation()  // 停止將 click event 向外傳出
            const $selector = $(this).parent()
            $selector.attr('data-mode', 'nodata')
        })
    }

    $filterSelect.each(function () {
        bindFilterSelectEvents($(this).get(0))
    })

    window.cloneFilterSelector = (filterSelect, target) => {

        // clone 時會如何處理
        const newSelector = $(filterSelect).clone().appendTo(target)
        bindFilterSelectEvents(newSelector.get(0))
        myTooltip.attach(newSelector)
    }

    window.bindTooltipToFilterSelector = $filterSelects => {

        $filterSelects.each(function () {

            const $currentSelector = $(this)
            bindFilterSelectEvents($currentSelector.get(0))
            myTooltip.attach($currentSelector)
        })
    }

}

/*
$(function () {

    initFilterSelect()
})
*/

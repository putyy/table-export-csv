<?php
declare(strict_types=1);

namespace Pt\WebExportCsv;

use Encore\Admin\Grid\Tools\AbstractTool;

class WebExportCsvTool extends AbstractTool
{
    protected $current_page_js_script = <<<HTML
<script type="application/javascript">
        function currentPageColumnHandle(td){
            return "";
        }

        function currentPageTableHeader(){
            var headStr = [];
            $(".content thead>tr>th").each(function(index,item){
                if($(item).hasClass('column-__row_selector__') || $(item).hasClass('column-__actions__')){
                    return true;
                }
                headStr.push($(item).text());
            });
            return headStr.join(',') + "\\n";
        }
</script>
HTML;

    protected $all_page_js_script = <<<HTML
<script type="application/javascript">
        function allPageColumnHandle(td){
            return "";
        }

        function allPageTableHeader(){
            var headStr = [];
            $(".content thead>tr>th").each(function(index,item){
                if($(item).hasClass('column-__row_selector__') || $(item).hasClass('column-__actions__')){
                    return true;
                }
                headStr.push($(item).text());
            });
            return headStr.join(',') + "\\n";
        }
</script>
HTML;

    /**
     * @var int 1导出当前页 2导出全部
     */
    protected $export_type = 1;

    protected $js_script = '';

    public function __construct(int $export_type = 1, string $js_func = '')
    {
        $this->export_type = $export_type;
        if ($js_func) {
            $this->js_script = $js_func;
        }
    }

    /**
     * @return \Illuminate\Contracts\Foundation\Application|\Illuminate\Contracts\View\Factory|\Illuminate\Contracts\View\View|string
     * 可重写上面的js函数
     * $grid->tools(function ($tools) {
     * $func = <<<HTML
     * <script type="application/javascript">
     * function currentPageColumnHandle(td){
     * return "666";
     * }
     * </script>
     * HTML;
     * $tools->append(new WebExportCsvTool(2, $func));
     * });
     */
    public function render()
    {
        $data = [
            'js_func' => $this->current_page_js_script . $this->js_script,
            'click_id' => 'exportCurrentPage',
            'export_title' => '导出当前页',
        ];
        if ($this->export_type !== 1) {
            $data = [
                'js_func' => $this->all_page_js_script . $this->js_script,
                'click_id' => 'exportAllPage',
                'export_title' => '导出全部(所有符合条件的数据)',
            ];
        }

        return view('table-export-csv::exportCsv', $data);
    }
}

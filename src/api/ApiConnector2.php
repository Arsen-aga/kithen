<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
class ApiConnector
{

    /**
     * Признак тестового запуска
     * @var bool
     */
    private bool $debug = true;
    /**
     * Метод запроса
     * @var
     */
    private $method;

    /**
     * Тело запроса
     * @var
     */
    private $body = false;
    /**
     * Базовый url API
     * @var string
     */
    private string $base_url = 'https://back.love-kitchen.ru/web/index.php/';

    /**
     * Метод API
     * @var
     */
    private $action;

    /**
     * Токен доступа. Если не указан - запрос уйдёт без авторизации
     * @var bool|string
     */
    private $token = false;
    /**
     * POST данные
     * [
     *      'actiion' => 'users/register',
     *          'method' => 'POST',
     *      'body' => '{"username" => "test"}'
     *      'token' => 'sdfjhsjdfghLKJHFh+kJLHKLJLHjHLKJhKHasdfas',
     *      'headers' => []
     * ]
     * @var
     */
    private $post;

    /**
     * Заголовки для запроса
     * @var array
     */
    private $headers = [
        'Content-Type:application/json'
    ];

    /**
     * Валидирует POST
     * @return void
     */
    private function validatePost()
    {

        if (empty($_POST)) {
            $this->log("POST is empty", $_POST);
            die;
        }

        $this->post = $_POST;
        $this->log("POST заполнен", $this->post);


        if (isset($this->post['action'])) {
            $this->action = $this->post['action'];
        }

        if (isset($this->post['method'])) {
            $this->method = $this->post['method'];
        }
        if (isset($this->post['body'])) {
            $this->body = $this->post['body'];
        }
        if (isset($this->post['headers'])) {
            $this->headers = $this->post['headers'];
        }

        if (isset($this->post['debug'])) {
            $this->debug = true;
        }
    }

    private function setHeaders()
    {
        $this->log("setHeaders");
        if ($this->post['token']) {
            $this->headers[] = 'Authorization: Bearer ' . $this->post['token'];
        }
        if ($this->post['headers']) {
            $this->headers = array_merge($this->headers, $this->post['headers']);
        }
        $this->log("Будут отправлены заголовки:", $this->headers);
    }


    /**
     * Отправляет GET запрос
     * @return bool|string
     */
    private function sendGet()
    {
        $this->log("sendGet");
        $this->log("Отправляем запрос на " . $this->base_url . $this->action);

        $ch = curl_init($this->base_url . $this->action);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        //curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->headers);

        $response = curl_exec($ch);
        curl_close($ch);

        $this->log("Ответ API", $response);
        return $response;
    }

    /**
     * Отправляет DELETE запрос
     * @return bool|string
     */
    private function sendDelete()
    {
        $this->log("sendDelete");
        $this->log("Отправляем запрос на " . $this->base_url . $this->action);

        $ch = curl_init($this->base_url . $this->action);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->headers);

        $response = curl_exec($ch);
        curl_close($ch);

        $this->log("Ответ API", $response);
        return $response;
    }
    /**
     * Отправляет POST запрос
     * @return bool|string
     */
    private function sendPost()
    {
        $this->log("sendPost");
        $this->log("Отправляем запрос на " . $this->base_url . $this->action);

        $ch = curl_init($this->base_url . $this->action);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        //curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->headers);

        if ($this->body) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($this->body, JSON_UNESCAPED_UNICODE));
        }

        $response = curl_exec($ch);
        curl_close($ch);

        $this->log("Ответ API", $response);
        return $response;
    }
    private function sendPostFile()
    {

        $this->log("sendPostFile");
        $this->log("Загружаем файл в папку tmp");

        $uploaddir = __DIR__ . '/tmp/';
        $uploadfile = $uploaddir . basename($_FILES['file']['name']);

        $this->log($uploadfile);
        if (move_uploaded_file($_FILES['file']['tmp_name'], $uploadfile)) {
            $this->log('Файл успешно загружен');
        } else {
            throw new \Exception("Wrong file");
        }

        $this->log("Отправляем запрос на " . $this->base_url . $this->action);

        $curl_files = array(
            'UploadForm[file]' => curl_file_create($uploadfile),
        );

        $post = array_merge($curl_files, $this->body);


        $ch = curl_init($this->base_url . $this->action);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->headers);


        $response = curl_exec($ch);
        curl_close($ch);

        $this->log("Ответ API", $response);
        return $response;
    }

    /**
     * Отправляет PUT запрос
     * @return bool|string
     */
    private function sendPut()
    {
        $this->log("sendPut");
        $this->log("Отправляем запрос на " . $this->base_url . $this->action);

        $ch = curl_init($this->base_url . $this->action);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        //curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->headers);

        if ($this->body) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($this->body, JSON_UNESCAPED_UNICODE));
        }

        $response = curl_exec($ch);
        curl_close($ch);

        $this->log("Ответ API", $response);
        return $response;
    }

    /**
     * Для тестов
     * @return bool|string
     * @throws Exception
     */
    private function sendTest()
    {
        ini_set('error_reporting', E_ALL);
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);

        $this->log("Отправляем запрос на " . $this->base_url . $this->action);

        $curl_files = array(
            'UploadForm[file]' => curl_file_create(__DIR__ . '/tmp/test.png'),
        );

        $post = array_merge($curl_files, $this->body);


        $ch = curl_init($this->base_url . $this->action);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->headers);


        $response = curl_exec($ch);
        curl_close($ch);

        $this->log("Ответ API", $response);
        return $response;
    }

    /**
     * Выводит сообщение для отладки
     * @param string $msg Текст
     * @param string|array|boolean $data Доп. данные
     * @param string $type Тип вывода p|v print_r|var_dump
     * @return void
     */
    private function log($msg, $data = false, $type = 'p')
    {

        if ($this->debug) {
            echo "$msg <br> \n";

            if ($data) {
                if ($type == 'p') {
                    print_r($data);
                } else {
                    var_dump($data);
                }
            }

            echo "<br> \n";
        }
    }

    /**
     * Собирает всё до кучи
     * @return void
     */
    public function init()
    {

        $this->log("init");
        $this->validatePost();
        $this->setHeaders();
        header("Access-Control-Allow-Origin: *");
        switch ($this->method) {
            case 'GET':
                echo $this->sendGet();
                break;
            case 'POST':
                echo $this->sendPost();
                break;
            case 'POSTFILE':
                echo $this->sendPostFile();
                break;
            case 'PUT':
                echo $this->sendPut();
                break;
            case 'DELETE':
                echo $this->sendDelete();
                break;
            case 'TEST':
                echo $this->sendTest();
                break;
            default:
                $this->log("Не верный параметр method");
                die;
        }
    }

}

$connector = new ApiConnector();
$connector->init();
